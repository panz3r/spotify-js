import dbus from 'dbus-next';
import { isArray, join, last, reduce, split, toLower } from 'lodash';

// Enable BigInt compatibility mode - https://www.npmjs.com/package/dbus-next#node-compatibility
//dbus.setBigIntCompat(true);

import {
  SpotifyAction,
  SpotifyPlaybackState,
  SpotifyService,
  SpotifyState,
  SpotifyTrack,
} from '../index';

interface PlayerInterface extends dbus.ClientInterface {
  Next(): Promise<void>;
  PlayPause(): Promise<void>;
  Previous(): Promise<void>;
}

interface PropertiesInterface extends dbus.ClientInterface {
  Get(interfaceName: string, propertyName: string): Promise<dbus.Variant>;
  Get<T>(interfaceName: string, propertyName: string): Promise<dbus.Variant<T>>;
}

type PlayerPlaybackState = 'Playing' | 'Paused' | 'Stopped';

interface MetadataVariant {
  [key: string]: dbus.Variant<any>;
}

interface SpotifyInterfacesRes {
  player: PlayerInterface;
  properties: PropertiesInterface;
}

class SpotifyLinux implements SpotifyService {
  private _player?: PlayerInterface;

  private _properties?: PropertiesInterface;

  public supportedActions: SpotifyAction[] = [
    'togglePlayPause',
    'previousTrack',
    'nextTrack',
  ];

  constructor() {
    this._getInterfaces();
  }

  public async isRunning(): Promise<boolean> {
    try {
      const { player, properties } = await this._getInterfaces();
      return !!player && !!properties;
    } catch {
      return false;
    }
  }

  public async getState(): Promise<SpotifyState> {
    const { properties } = await this._getInterfaces();

    const state = await properties.Get<PlayerPlaybackState>(
      'org.mpris.MediaPlayer2.Player',
      'PlaybackStatus'
    );

    return {
      state: toLower(state.value) as SpotifyPlaybackState,
    };
  }

  public async getTrack(): Promise<SpotifyTrack> {
    const { properties } = await this._getInterfaces();

    const metadata = await properties.Get<MetadataVariant>(
      'org.mpris.MediaPlayer2.Player',
      'Metadata'
    );

    const trackMeta = reduce(
      metadata.value,
      (dst, meta, k) => {
        const key = last(split(k, ':'));
        if (key) {
          const { value } = meta;
          dst[key] = isArray(value) ? join(value, ' & ') : value;
        }

        return dst;
      },
      {} as SpotifyTrack
    );

    trackMeta.name = trackMeta.title;

    return trackMeta;
  }

  public async togglePlayPause(): Promise<SpotifyState> {
    const { player } = await this._getInterfaces();

    await player.PlayPause();

    return this.getState();
  }

  public async previousTrack(): Promise<SpotifyTrack> {
    const { player } = await this._getInterfaces();

    await player.Previous();

    return this.getTrack();
  }

  public async nextTrack(): Promise<SpotifyTrack> {
    const { player } = await this._getInterfaces();

    await player.Next();

    return this.getTrack();
  }

  // Internal methods
  private async _getInterfaces(): Promise<SpotifyInterfacesRes> {
    if (!this._player || !this._properties) {
      return dbus
        .sessionBus()
        .getProxyObject(
          'org.mpris.MediaPlayer2.spotify',
          '/org/mpris/MediaPlayer2'
        )
        .then(spotifyProxy => {
          this._player = spotifyProxy.getInterface<PlayerInterface>(
            'org.mpris.MediaPlayer2.Player'
          );
          this._properties = spotifyProxy.getInterface<PropertiesInterface>(
            'org.freedesktop.DBus.Properties'
          );

          return {
            player: this._player,
            properties: this._properties,
          };
        })
        .catch(err => {
          throw err;
        });
    }

    return {
      player: this._player,
      properties: this._properties,
    };
  }
}

export default SpotifyLinux;
