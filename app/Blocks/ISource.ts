import {IBlock} from './IBlock';
import {IEffect} from './IEffect';
import ObservableCollection = etch.collections.ObservableCollection;
import {SoundCloudTrack} from '../Core/Audio/SoundCloud/SoundcloudTrack';
import {Source} from './Source';
import {VoiceCreator as Voice} from './Interaction/VoiceObject';

export interface ISource extends IBlock {
    Connections: ObservableCollection<IEffect>;
    Sources?: any[];
    Grains?: any[];
    Envelopes?: Tone.AmplitudeEnvelope[];
    AudioInput?: Tone.Mono;
    Settings?: ToneSettings;
    ParticlePowered: boolean;
    LaserPowered: boolean;
    PowerAmount: number;
    UpdateCollision: boolean;
    Collisions: any[];
    CheckRange: number;
    SearchResults: SoundCloudTrack[];
    Searching: Boolean;
    ResultsPage: number;
    SearchString: string;
    PlaybackSignal: any;
    MaxDensity?: number;
    RecordedAudio?: any;
    LoopStartPosition?: number;
    LoopEndPosition?: number;
    ActiveVoices: Voice[];
    FreeVoices: Voice[];
    MonoVoice: Voice;
    AddEffect(effect: IEffect): void;
    RemoveEffect(effect: IEffect): void;
    CreateSource(): any;
    CreateEnvelope(): Tone.AmplitudeEnvelope;
    ValidateEffects(): void;
    TriggerAttack(index?: number|string): void;
    TriggerRelease(index?: number|string, forceRelease?: boolean): void;
    TriggerAttackRelease(duration?: Tone.Time, time?: Tone.Time, velocity?: number): void;
    IsPowered(): boolean;
    Refresh(): void;
    AddPower(): void;
    RemovePower(): void;
    NoteOn(controller: string, note?:number, polyphonic?: boolean, glide?:number, velocity?: number): void;
    NoteOff(controller: string, note?:number): void;
    NoteUpdate(): void;
    CreateVoices();
}