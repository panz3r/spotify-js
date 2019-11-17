import {
  SpotifyAction,
  SpotifyService,
  SpotifyState,
  SpotifyTrack,
} from '../index';

class SpotifyDefault implements SpotifyService {
  public supportedActions: SpotifyAction[] = [];

  constructor() {
    console.error('Unsupported OS');
  }

  public isRunning(): Promise<boolean> {
    return Promise.reject('Not implemented');
  }

  public getState(): Promise<SpotifyState> {
    return Promise.reject('Not implemented');
  }

  public getTrack(): Promise<SpotifyTrack> {
    return Promise.reject('Not implemented');
  }

  public async togglePlayPause(): Promise<SpotifyState> {
    return Promise.reject('Not implemented');
  }

  public async previousTrack(): Promise<SpotifyTrack> {
    return Promise.reject('Not implemented');
  }

  public async nextTrack(): Promise<SpotifyTrack> {
    return Promise.reject('Not implemented');
  }
}

export default SpotifyDefault;
