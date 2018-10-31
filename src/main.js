import './styles/main.scss';
import { playList } from './data/audio.js';

class AudioPlayer {
  constructor(options) {
    this.element = options.element;

    this.activeTrackIndex = 0;
    this.audio = new Audio;
    this.onProgressBarPin = false;
    this.onVolumeBarPin = false;
    this.isPlaying = false;

    this.cacheElements();
    this.addElements();
    this.addClickEvents();
    this.addAudioEvents();
    this.addMouseEvents();
    this.setImagesStyle();
    this.addResizeEvent();
    this.setActiveTrack(this.activeTrackIndex);
  }

  cacheElements() {
    this.buttons = document.querySelectorAll('.current-track__body__controls__item');
    this.trackTotalLength = document.querySelector('.current-track__body__track-progress__time-display__total');
    this.trackCurrentTime = document.querySelector('.current-track__body__track-progress__time-display__current');
    this.progressBarPin = document.querySelector('.current-track__body__track-progress__progress-bar__pin');
    this.progressBar = document.querySelector('.current-track__body__track-progress__progress-bar');
    this.volumeBar = document.querySelector('.current-track__body__volume__bar');
    this.volumeBarPin = document.querySelector('.current-track__body__volume__bar__pin');
    this.header = document.querySelector('.current-track__header');
    this.progressBarWidth = this.progressBar.offsetWidth - this.progressBarPin.offsetWidth;
    this.progressBarlistener = (e) => this.moveTrackProgressBarPin(e);
    this.volumeBarlistener = (e) => this.moveVolumeBarPin(e);
  }

  // ================================
  // Events
  // ================================
  addClickEvents() {
    [...this.buttons].forEach((item) => {
      item.addEventListener('click', (e) => this.handleButtonClick(e));
    });

    this.progressBar.addEventListener('click', (e) => {
      this.handleProgressBarClick(e);
      this.audio.currentTime = this.duration * this.getClickPercent(event, this.progressBar);
    });

    this.volumeBar.addEventListener('click', (e) => this.handleVolumeBarClick(e));

    const volumeIcon = document.querySelector('.current-track__body__volume__control');
    volumeIcon.addEventListener('click', () => this.handleVolumeIconClick());

    const tracks = [...this.tracksListDOMElement.children];
    tracks.forEach((item, index) => {
      item.addEventListener('click', (e) => this.handleTracksListItemClick(e, item, index));
    });
  }

  addAudioEvents() {
    this.audio.addEventListener('timeupdate', () => { 
      this.time = this.audio.currentTime;
      this.displayCurrentTime(this.time);
      this.trackProgressUpdate();
    });

    this.audio.addEventListener('canplaythrough', () => {
      this.duration = this.audio.duration;
      this.displayTotalTime(this.duration);
    });
  }

  addMouseEvents() {
    this.progressBarPin.addEventListener('mousedown', () => this.handleProgressBarPinMouseDown());
    window.addEventListener('mouseup', (e) => this.handleProgressBarPinMouseUp(e));

    this.volumeBarPin.addEventListener('mousedown', () => this.handleVoluMeBarPinMouseDown());
    window.addEventListener('mouseup', (e) => this.handleVolumeBarPinMouseUp(e));
  }

  addResizeEvent() {
    window.addEventListener('resize', (e) => this.handleWindowResize(e));
  }

  // ================================
  // Handlers
  // ================================
  handleVolumeIconClick() {
    this.volumeBar.classList.toggle('current-track__body__volume__bar--visible');
  }

  handleProgressBarClick(event) {
    this.moveTrackProgressBarPin(event);
  }

  handleVolumeBarClick(event) {
    this.moveVolumeBarPin(event);
    this.updateVolume(event);
  }

  handleTracksListItemClick(event, item, index) {
    const sameSong = index === this.activeTrackIndex
    this.activeTrackIndex = index;

    this.setActiveTracksListItemStyle();
    
    if(!sameSong) {
      this.setActiveTrack(this.activeTrackIndex);
    }
    
    this.playTrack(); 
  }

  handleProgressBarPinMouseDown() {
    this.onProgressBarPin = true;
    window.addEventListener('mousemove', this.progressBarlistener, true);
    this.audio.removeEventListener('timeupdate', () => this.trackProgressUpdate());
  }

  handleProgressBarPinMouseUp(event) {
    if (this.onProgressBarPin) {
      this.moveTrackProgressBarPin(event);
    
      window.removeEventListener('mousemove', this.progressBarlistener, true);

      this.audio.currentTime = this.duration * this.getClickPercent(event, this.progressBar);
      this.audio.addEventListener('timeupdate', () => this.trackProgressUpdate());
    }

    this.onProgressBarPin = false;
  }

  handleVoluMeBarPinMouseDown() {
    this.onVolumeBarPin = true;
    window.addEventListener('mousemove', this.volumeBarlistener, true);
  }

  handleVolumeBarPinMouseUp(event) {
    if(this.onVolumeBarPin) {
      this.moveVolumeBarPin(event);
      this.updateVolume(event);
      window.removeEventListener('mousemove', this.volumeBarlistener, true);
    }

    this.onVolumeBarPin = false;
  }

  handleButtonClick(event) {
    const { type } = event.target.dataset;;

    switch(type) {
      case 'play-pause': this.playTrack();
      break;
      case 'previous': this.goToPreviousTrack();
      break;
      case 'next': this.goToNextTrack();
      break;
      default: break;
    }
  }

  handleWindowResize() {
    this.setImagesStyle();
    this.moveContainerImages();
  }

  // ================================
  // Builders
  // ================================
  buildTrackImages() {
    const imagesContainer = document.createElement('div');
    const className = 'current-track__header__images';
    imagesContainer.setAttribute('class', className);

    playList.forEach((item) => {
      const trackItem = document.createElement('div');
      trackItem.setAttribute('class', `${className}__item`);

      const image = document.createElement('div');
      image.setAttribute('class', `${className}__item__image`);

      image.innerHTML = `<img src='${item.image}' />`;

      const disc = document.createElement('div');
      disc.setAttribute('class', `${className}__item__image__disc`);

      const details = document.createElement('div');
      details.setAttribute('class', `${className}__item__details`);
  
      details.innerHTML = `<div class='${className}__item__details__title'>
                                      <span>${item.title}</span>
                                    </div>
                                    <div class='${className}__item__details__artist'>
                                      <span>${item.artist}</span>
                                    </div>
                                    `;

      image.appendChild(disc);
      trackItem.appendChild(image);
      trackItem.appendChild(details);
      imagesContainer.appendChild(trackItem);
    });

    return imagesContainer;
  }

  buildToneArm()  {

    const toneArm =  document.createElement('div');
    toneArm.setAttribute('class', 'current-track__header__tone-arm');

    const toneArmTopDetail =  document.createElement('div');
    toneArmTopDetail.setAttribute('class', 'current-track__header__tone-arm__top-detail');


    const stylus = document.createElement('div');
    stylus.setAttribute('class', 'current-track__header__tone-arm__stylus');

    toneArm.appendChild(toneArmTopDetail);
    toneArm.appendChild(stylus);

    return toneArm;

  }

  buildTracksList() {
    const container = document.createElement('div');

    const className = 'tracks-list';
    container.setAttribute('class', className)

    playList.forEach((item) => {
      const listItem = document.createElement('div');
      listItem.setAttribute('class', `${className}__item`);
      listItem.innerHTML = `<div class='${className}__item__icon'>
                              <svg class='icon icon--play' version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                              <title>play</title>
                              <path d="M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM12 9l12 7-12 7z"></path>
                              </svg>
                              <svg class='icon icon--pause' version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                              <title>pause</title>
                              <path d="M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM10 10h4v12h-4zM18 10h4v12h-4z"></path>
                              </svg>
                            </div>
                            <div class='${className}__item__title'>
                              <span>${item.title}</span>
                            </div>
                            <div class='${className}__item__artist'>
                             <span>${item.artist}</span>
                            </div>
                           `;

      container.appendChild(listItem);
    });

    return container;
  }

  // ================================
  // Setters
  // ================================
  setImagesStyle() {
    const images = [...this.imageDOMElement.children];
    const width = this.header.offsetWidth;
    images.forEach((item) => item.style.width = `${width}px`);

    this.imageDOMElement.style.width = `${width * playList.length}px`;
  }

  setActiveTrack(index) {
    this.audio.src = playList[index].track;
  }

  setActiveTracksListItemStyle() {
    const tracksListItems = [...this.tracksListDOMElement.children];

    tracksListItems.forEach((item, tracksListItemIndex) => {
      if(tracksListItemIndex === this.activeTrackIndex) {
        item.classList.add(`tracks-list__item--clicked`);
      } else {
        item.classList.remove(`tracks-list__item--clicked`);
      }
    });
  }

  // ================================
  // Getters
  // ================================

  getClickPercent(event, element) {
    return (event.clientX - this.getPosition(element)) / element.offsetWidth;
  }

  getPosition(element) {
    return element.getBoundingClientRect().left;
  }

  // ================================
  // Others
  // ================================

  updateVolume(event) {
    const currentVolume = this.getClickPercent(event, this.volumeBar);
    const volumeIcon = document.querySelector('.current-track__body__volume__control');

    if(currentVolume <= 0) {
      this.audio.volume = 0;
      volumeIcon.classList.add('current-track__body__volume__control--muted');
      return;
    } else {
      volumeIcon.classList.remove('current-track__body__volume__control--muted');
    }

    if(currentVolume >= 1) {
      this.audio.volume = 1;
      return;
    } 

    this.audio.volume = currentVolume;
  }

  moveTrackProgressBarPin(event) {
    const position = this.getPosition(this.progressBar);
    const marginLeft = event.clientX - position;

    this.calculatePinPosition(this.progressBarPin, marginLeft, this.progressBarWidth);
  }

  moveVolumeBarPin(event) {
    const position = this.getPosition(this.volumeBar);
    const marginLeft = event.clientX - position;

    this.calculatePinPosition(this.volumeBarPin, marginLeft, this.volumeBar.offsetWidth);
  }

  calculatePinPosition(pin, marginLeft, width) {

    if (marginLeft >= 0 && marginLeft <= width) {
      pin.style.left= `${marginLeft}px`;
    }
    if (marginLeft <= 0) {
      pin.style.left = `0px`;
    }
    if (marginLeft >= width) {
      pin.style.left = `${width - pin.offsetWidth}px`;
    }
  }

  trackProgressUpdate() {
    const playPercent = this.progressBarWidth * (this.time / this.duration);
    this.progressBarPin.style.left = `${playPercent}px`;

    if(this.audio.currentTime >= this.duration) {
      this.goToNextTrack();
    }
  }

  displayCurrentTime(time) {
    const current = this.calculateTrackCurrentTime(time);
    this.trackCurrentTime.innerHTML = `<span>${current}</span>`;
  }

  displayTotalTime(length) {
    const totalTime = this.calculateTotalTrackLength(length);
    this.trackTotalLength.innerHTML = `<span>${totalTime}</span>`;
  }

  moveContainerImages() {
    const currentTrack = document.querySelector('.current-track');
    const width = this.header.offsetWidth;
    const target = -(width * this.activeTrackIndex);
    this.imageDOMElement.style.transform = `translate(${target}px, 0)`;
  }

  playTrack() {
    const playButton = document.querySelector('.play');
    const tracksListItem = [...this.tracksListDOMElement.children][this.activeTrackIndex];
    const images = document.querySelectorAll('.current-track__header__images__item__image');
    const activeImage = images[this.activeTrackIndex];
    console.log(images)
    console.log(activeImage);
    console.log('aaa')
    const className = `tracks-list__item--clicked`;

    if(this.audio.paused) {
      this.audio.play();
      activeImage.classList.add(`current-track__header__images__item__image--active`);
      activeImage.style.animationPlayState = `running`;
      playButton.classList.add(`play--paused`);
      tracksListItem.classList.add(className);
    } else {
      this.audio.pause();
      activeImage.style.animationPlayState = `paused`;
      this.isPlaying = false;
      playButton.classList.remove(`play--paused`);
      tracksListItem.classList.remove(className);
    }

    this.moveContainerImages();
  }

  goToNextTrack() {
    this.activeTrackIndex = (this.activeTrackIndex + 1) % playList.length;
    this.setActiveTracksListItemStyle();
    this.setActiveTrack(this.activeTrackIndex);
    this.playTrack();
  }

  goToPreviousTrack() {
    if(this.activeTrackIndex === 0) {
      return;
    }
    this.activeTrackIndex = (this.activeTrackIndex - 1) % playList.length;
    this.setActiveTracksListItemStyle();
    this.setActiveTrack(this.activeTrackIndex);
    this.playTrack();
  }

  calculateTotalTrackLength(duration) {
    let seconds = Math.floor(duration);    
    let minutes = Math.floor( seconds / 60 );
    minutes = minutes >= 10 ? minutes : `0${minutes}`;    
    seconds = Math.floor( seconds % 60 );
    seconds = seconds >= 10 ? seconds : `0${seconds}`;  
    const time = `${minutes}:${seconds}`;
    return time;
  }

  calculateTrackCurrentTime(currentTime) {
    const currentMinute = parseInt(currentTime / 60) % 60;
    const currentSecondsLong = currentTime % 60;
    const currentSeconds = currentSecondsLong.toFixed();
    const currentTrackTime = (currentMinute < 10 
      ? `0${currentMinute}` 
      : currentMinute) + `:` 
      + (currentSeconds < 10 
      ? `0${currentSeconds}`
      : currentSeconds);
    return currentTrackTime;
  }

  addElements() {
    this.imageDOMElement = this.buildTrackImages();
    this.tracksListDOMElement = this.buildTracksList();
    this.toneArmDOMElement = this.buildToneArm();
    this.header.appendChild(this.imageDOMElement);
    this.header.appendChild(this.toneArmDOMElement);
    this.element.appendChild(this.tracksListDOMElement);
  }
}


const players = document.querySelectorAll('.audio-player');

players.forEach((element) => {
  new AudioPlayer({ element });
});
