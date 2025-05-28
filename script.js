 class EnhancedMusicPlayer {
        constructor() {
          this.currentSong = null;
          this.currentSongIndex = 0;
          this.isPlaying = false;
          this.playedSongs = [];
          this.uploadedFiles = [];
          this.playlists = {
            local: [],
            arijit: [],
            darshan: [],
            trending: [],
            yearly: [],
            oldies: [],
            new: [],
            podcasts: [],
            custom: []
          };
          this.currentPlaylist = [];
          this.isShuffled = false;
          this.isRepeating = false;
          
          this.audioPlayer = document.getElementById('audio-player');
          this.init();
        }

        init() {
          this.setupFileUpload();
          this.setupPlayerControls();
          this.setupAudioEvents();
          this.addPlayButtonsToCards();
          this.updatePlayerDisplay();
          this.loadDemoSongs();
        }

        loadDemoSongs() {
          // Add some demo songs to playlists for demonstration
          this.playlists.arijit = [
            { name: "Tum Hi Ho", artist: "Arijit Singh", duration: "4:22" },
            { name: "Channa Mereya", artist: "Arijit Singh", duration: "4:49" },
            { name: "Ae Dil Hai Mushkil", artist: "Arijit Singh", duration: "4:29" }
          ];
          
          this.playlists.trending = [
            { name: "Kesariya", artist: "Pritam", duration: "4:28" },
            { name: "Raataan Lambiyan", artist: "Tanishk Bagchi", duration: "3:43" },
            { name: "Mann Bharryaa 2.0", artist: "B Praak", duration: "4:15" }
          ];
        }
        setupFileUpload() {
          const uploadInput = document.getElementById('music-upload');
          const createPlaylistBtn = document.getElementById('create-playlist-btn');
          
          uploadInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
          });
          
          createPlaylistBtn.addEventListener('click', () => {
            this.createCustomPlaylist();
          });
        }

        handleFileUpload(files) {
          Array.from(files).forEach(file => {
            if (file.type.startsWith('audio/')) {
              const fileUrl = URL.createObjectURL(file);
              const fileData = {
                name: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Unknown Artist",
                file: file,
                url: fileUrl,
                duration: "Loading..."
              };
              
              this.uploadedFiles.push(fileData);
              this.playlists.local.push(fileData);
              
              // Get duration
              const tempAudio = new Audio(fileUrl);
              tempAudio.addEventListener('loadedmetadata', () => {
                fileData.duration = this.formatTime(tempAudio.duration);
                this.updateMusicFilesList();
              });
            }
          });
          
          this.updateMusicFilesList();
        }

        updateMusicFilesList() {
          const container = document.getElementById('music-files-list');
          container.innerHTML = '';
          
          this.uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'music-file-item';
            fileItem.innerHTML = `
              <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-duration">${file.duration} • ${file.artist}</div>
              </div>
              <button class="play-file-btn" onclick="musicPlayer.playUploadedFile(${index})">
                ▶️
              </button>
            `;
            container.appendChild(fileItem);
          });
        }

        playUploadedFile(index) {
          const file = this.uploadedFiles[index];
          this.playSong(file.name, file.url);
        }

        setupPlayerControls() {
          const playButton = document.getElementById('play');
          const prevButton = document.getElementById('prev');
          const nextButton = document.getElementById('next');
          const shuffleButton = document.getElementById('shuffle');
          const repeatButton = document.getElementById('repeat');
          const clearHistoryBtn = document.getElementById('clear-history');
          const volumeSlider = document.getElementById('volume-slider');
          const progressContainer = document.getElementById('progress-container');

          playButton.addEventListener('click', () => this.togglePlayPause());
          prevButton.addEventListener('click', () => this.playPrevious());
          nextButton.addEventListener('click', () => this.playNext());
          shuffleButton.addEventListener('click', () => this.toggleShuffle());
          repeatButton.addEventListener('click', () => this.toggleRepeat());
          clearHistoryBtn.addEventListener('click', () => this.clearHistory());
          
          volumeSlider.addEventListener('input', (e) => {
            this.audioPlayer.volume = e.target.value / 100;
          });
          
          progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
          });
        }

        setupAudioEvents() {
          this.audioPlayer.addEventListener('timeupdate', () => {
            this.updateProgress();
          });
          
          this.audioPlayer.addEventListener('ended', () => {
            this.handleSongEnd();
          });
          
          this.audioPlayer.addEventListener('loadedmetadata', () => {
            document.getElementById('total-time').textContent = this.formatTime(this.audioPlayer.duration);
          });
        }

        addPlayButtonsToCards() {
          const cards = document.querySelectorAll('.card');
          
          cards.forEach((card) => {
            const playButton = document.createElement('button');
            playButton.innerHTML = '▶️';
            playButton.className = 'card-play-btn';
            playButton.style.cssText = `
              position: absolute;
              top: 10px;
              right: 10px;
              background: #1db954;
              color: white;
              border: none;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s ease;
            `;
            
            card.style.position = 'relative';
            
            playButton.addEventListener('click', (e) => {
              e.stopPropagation();
              this.playPlaylist(card.dataset.playlist);
            });
            
            card.addEventListener('click', () => {
              this.playPlaylist(card.dataset.playlist);
            });
            
            card.appendChild(playButton);
          });
        }

        playPlaylist(playlistName) {
          const playlist = this.playlists[playlistName] || [];
          if (playlist.length > 0) {
            this.currentPlaylist = [...playlist];
            this.currentSongIndex = 0;
            const song = playlist[0];
            this.playSong(song.name, song.url || null, song.artist);
          } else {
            alert(`No songs in ${playlistName} playlist. Upload some music files!`);
          }
        }

        playSong(songName, audioUrl = null, artist = "Unknown Artist") {
          this.currentSong = { name: songName, artist: artist, url: audioUrl };
          
          if (audioUrl) {
            this.audioPlayer.src = audioUrl;
            this.audioPlayer.play();
            this.isPlaying = true;
            document.getElementById('audio-visualizer').style.display = 'flex';
          } else {
            // For demo songs without actual audio files
            this.isPlaying = true;
            document.getElementById('audio-visualizer').style.display = 'flex';
            console.log(`Now playing: ${songName} by ${artist}`);
          }
          
          this.addToPlayedSongs(songName, artist);
          this.updatePlayerDisplay();
          this.updatePlayButton();
        }

        togglePlayPause() {
          if (this.audioPlayer.src) {
            if (this.isPlaying) {
              this.audioPlayer.pause();
              this.isPlaying = false;
              document.getElementById('audio-visualizer').style.display = 'none';
            } else {
              this.audioPlayer.play();
              this.isPlaying = true;
              document.getElementById('audio-visualizer').style.display = 'flex';
            }
          } else if (this.currentSong) {
            this.isPlaying = !this.isPlaying;
            if (this.isPlaying) {
              document.getElementById('audio-visualizer').style.display = 'flex';
            } else {
              document.getElementById('audio-visualizer').style.display = 'none';
            }
          }
          
          this.updatePlayButton();
        }

        playNext() {
          if (this.currentPlaylist.length > 0) {
            this.currentSongIndex = (this.currentSongIndex + 1) % this.currentPlaylist.length;
            const song = this.currentPlaylist[this.currentSongIndex];
            this.playSong(song.name, song.url, song.artist);
          }
        }

        playPrevious() {
          if (this.currentPlaylist.length > 0) {
            this.currentSongIndex = this.currentSongIndex > 0 ? this.currentSongIndex - 1 : this.currentPlaylist.length - 1;
            const song = this.currentPlaylist[this.currentSongIndex];
            this.playSong(song.name, song.url, song.artist);
          }
        }

        toggleShuffle() {
          this.isShuffled = !this.isShuffled;
          const shuffleBtn = document.getElementById('shuffle');
          shuffleBtn.style.color = this.isShuffled ? '#1db954' : '#333';
        }

        toggleRepeat() {
          this.isRepeating = !this.isRepeating;
          const repeatBtn = document.getElementById('repeat');
          repeatBtn.style.color = this.isRepeating ? '#1db954' : '#333';
        }

        handleSongEnd() {
          if (this.isRepeating) {
            this.audioPlayer.currentTime = 0;
            this.audioPlayer.play();
          } else {
            this.playNext();
          }
        }

        addToPlayedSongs(songName, artist) {
          const songInfo = `${songName} - ${artist}`;
          this.playedSongs = this.playedSongs.filter(song => song !== songInfo);
          this.playedSongs.unshift(songInfo);
          
          if (this.playedSongs.length > 10) {
            this.playedSongs = this.playedSongs.slice(0, 10);
          }
          
          this.updatePlayedSongsDisplay();
        }

        updatePlayedSongsDisplay() {
          const container = document.getElementById('played-songs');
          container.innerHTML = '';
          
          if (this.playedSongs.length === 0) {
            const defaultDiv = document.createElement('div');
            defaultDiv.className = 'played-song';
            defaultDiv.innerHTML = '<span>No songs played yet</span>';
            container.appendChild(defaultDiv);
          } else {
            this.playedSongs.forEach(song => {
              const div = document.createElement('div');
              div.className = 'played-song';
              div.innerHTML = `<span>${song}</span>`;
              div.style.cursor = 'pointer';
              div.addEventListener('click', () => {
                const [songName, artist] = song.split(' - ');
                this.playSong(songName, null, artist);
              });
              container.appendChild(div);
            });
          }
        }

        clearHistory() {
          this.playedSongs = [];
          this.updatePlayedSongsDisplay();
        }

        updatePlayerDisplay() {
          const heading = document.getElementById('lower-right-heading');
          if (this.currentSong) {
            heading.textContent = `♪ ${this.currentSong.name} - ${this.currentSong.artist}`;
          }
        }

        updatePlayButton() {
          const playButton = document.getElementById('play');
          playButton.innerHTML = this.isPlaying ? '⏸️ Pause' : '▶️ Play';
        }

        updateProgress() {
          if (this.audioPlayer.duration) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            document.getElementById('progress-bar').style.width = progress + '%';
            document.getElementById('current-time').textContent = this.formatTime(this.audioPlayer.currentTime);
          }
        }

        formatTime(seconds) {
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        createCustomPlaylist() {
          const playlistName = prompt('Enter playlist name:');
          if (playlistName) {
            this.playlists[playlistName.toLowerCase()] = [];
            alert(`Playlist "${playlistName}" created! You can now add songs to it.`);
          }
        }
      }

      // Initialize the enhanced music player
      document.addEventListener('DOMContentLoaded', () => {
        window.musicPlayer = new EnhancedMusicPlayer();
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (window.musicPlayer && !e.target.matches('input')) {
          switch(e.code) {
            case 'Space':
              e.preventDefault();
              window.musicPlayer.togglePlayPause();
              break;
            case 'ArrowLeft':
              e.preventDefault();
              window.musicPlayer.playPrevious();
              break;
            case 'ArrowRight':
              e.preventDefault();
              window.musicPlayer.playNext();
              break;
          }
        }
      });