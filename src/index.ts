import opn from 'open';
import os from 'os';

import { SpotifyDarwin, SpotifyDefault, SpotifyLinux } from './spotify';

export type SpotifyAction = 'togglePlayPause' | 'previousTrack' | 'nextTrack';

export type SpotifyPlaybackState = 'playing' | 'paused' | 'stopped';

export interface SpotifyState {
  state: SpotifyPlaybackState;
}

export interface SpotifyTrack {
  name: string;
  [key: string]: any;
}

export interface SpotifyService {
  supportedActions: SpotifyAction[];

  isRunning(): Promise<boolean>;

  getState(): Promise<SpotifyState>;

  getTrack(): Promise<SpotifyTrack>;

  togglePlayPause(): Promise<SpotifyState>;

  previousTrack(): Promise<SpotifyTrack>;

  nextTrack(): Promise<SpotifyTrack>;
}

export class SpotifyManager {
  private spotifySrv: SpotifyService;

  constructor() {
    switch (os.platform()) {
      case 'darwin':
        this.spotifySrv = new SpotifyDarwin();
        break;

      case 'linux':
        this.spotifySrv = new SpotifyLinux();
        break;

      default:
        this.spotifySrv = new SpotifyDefault();
    }
  }

  launchSpotify() {
    return opn('spotify://', { url: true });
  }

  supportedActions() {
    return this.spotifySrv.supportedActions;
  }

  isRunning() {
    return this.spotifySrv.isRunning();
  }

  getState() {
    return this.spotifySrv.getState();
  }

  togglePlayPause() {
    return this.spotifySrv.togglePlayPause();
  }

  previousTrack() {
    return this.spotifySrv.previousTrack();
  }

  nextTrack() {
    return this.spotifySrv.nextTrack();
  }

  getTrack() {
    return this.spotifySrv.getTrack();
  }
}
