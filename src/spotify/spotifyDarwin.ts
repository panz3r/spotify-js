import spotify from 'spotify-node-applescript';

import {
  SpotifyAction,
  SpotifyService,
  SpotifyState,
  SpotifyTrack,
} from '../index';

class SpotifyDarwin implements SpotifyService {
  public supportedActions: SpotifyAction[] = [
    'togglePlayPause',
    'previousTrack',
    'nextTrack',
  ];

  public isRunning(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      spotify.isRunning((err, isRunning) => {
        if (err) {
          reject(err);
        } else {
          resolve(isRunning);
        }
      });
    });
  }

  public getState(): Promise<SpotifyState> {
    return new Promise((resolve, reject) => {
      spotify.getState((err, state) => {
        if (err) {
          reject(err);
        } else {
          resolve({ state: state.state });
        }
      });
    });
  }

  public getTrack(): Promise<SpotifyTrack> {
    return new Promise((resolve, reject) => {
      spotify.getTrack((err, track) => {
        if (err) {
          reject(err);
        } else {
          resolve(track);
        }
      });
    });
  }

  public async togglePlayPause(): Promise<SpotifyState> {
    await new Promise(resolve => {
      spotify.playPause(resolve);
    });

    return this.getState();
  }

  public async previousTrack(): Promise<SpotifyTrack> {
    await new Promise(resolve => {
      spotify.previous(resolve);
    });

    return this.getTrack();
  }

  public async nextTrack(): Promise<SpotifyTrack> {
    await new Promise(resolve => {
      spotify.next(resolve);
    });

    return this.getTrack();
  }
}

export default SpotifyDarwin;
