import Effect = require("../Effect");
import ISource = require("../ISource");
import Grid = require("../../Grid");
import App = require("../../App");
import PooledOscillator = require("../../PooledOscillator");
import KeyDownEventArgs = require("../../Core/Inputs/KeyDownEventArgs");
import PitchComponent = require("./Pitch");

class Keyboard extends Effect {

    public Name: string = 'Keyboard';
    private _nodes = [];
    public BaseFrequency: number;
    public CurrentOctave: number;
    public KeysDown = {};
    public KeyMap: Object;

    public Settings = {
        isPolyphonic: false,
        glide: 0.05 // glide only works in monophonic mode
    };

    constructor(grid: Grid, position: Point){
        super(grid, position);

        // Define Outline for HitTest
        this.Outline.push(new Point(-1, 0),new Point(0, -1),new Point(2, 1),new Point(1, 2),new Point(-1, 2));
    }


    Draw() {
        super.Draw();
        this.Grid.BlockSprites.Draw(this.Position,true,"keyboard");
    }

    Attach(source:ISource): void{
        super.Attach(source);

        if (this.Source.Settings.oscillator){
            this.BaseFrequency = this.Source.Settings.oscillator.frequency;
            this.CurrentOctave = this.GetStartOctave();
            this.CurrentOctave--;
        }

        this.KeysDown = {};

        App.KeyboardInput.KeyDownChange.on((e: Fayde.IEventBindingArgs<KeyDownEventArgs>) => {
            this.KeysDown = (<any>e).KeysDown;

            // for all modifiables
            for (var i = 0; i < this.Source.Source.length; i++) {
                this.KeyboardDown((<any>e).KeyDown);
            }
            console.log(this);
        }, this);

        App.KeyboardInput.KeyUpChange.on((e: Fayde.IEventBindingArgs<KeyDownEventArgs>) => {
            this.KeysDown = (<any>e).KeysDown;

            this.KeyboardUp((<any>e).KeyUp);
        }, this);
        //this.AddListeners();
    }

    Detach(source:ISource): void {
        super.Detach(source);

        App.KeyboardInput.KeyDownChange.off((e: Fayde.IEventBindingArgs<KeyDownEventArgs>) => {
            //this.KeyboardDown((<any>e).KeyDown);
            //this.KeysDown = (<any>e).KeysDown;
        }, this);

        App.KeyboardInput.KeyUpChange.off((e: Fayde.IEventBindingArgs<KeyDownEventArgs>) => {
            //this.KeyboardUp((<any>e).KeyUp);
            //this.KeysDown = (<any>e).KeysDown;
        }, this);


        if (this.Source.Source.frequency) {
            this.Source.Source.frequency.setValue(this.Source.Settings.oscillator.frequency);
        }
    }

    Delete(){
        // TODO: CALL DISCONNECT if not already disconnected
    }

    SetValue(param: string,value: number) {
        super.SetValue(param,value);
        var jsonVariable = {};
        jsonVariable[param] = value;

        if (param == "glide") {
            this.Settings.glide = value/100;
        }
    }

    GetValue(param: string) {
        super.GetValue(param);
        var val;

        if (param == "glide") {
            val = this.Settings.glide*100;
        }
        return val;
    }

    OpenParams() {
        super.OpenParams();

        this.ParamJson =
        {
            "name" : "Keyboard",
            "parameters" : [

                {
                    "type" : "slider",
                    "name" : "Glide",
                    "setting" :"glide",
                    "props" : {
                        "value" : this.Component.GetValue("glide"),
                        "min" : 0.001,
                        "max" : 100,
                        "truemin" : 0,
                        "truemax" : 1,
                        "quantised" : false,
                        "centered" : false
                    }
                }
            ]
        };
    }


    GetStartOctave(): number {
        var octave,
            note = this.Source.Source.frequencyToNote(this.BaseFrequency);

        if (note.length === 3) {
            octave = parseInt(note.charAt(2));
        } else {
            octave = parseInt(note.charAt(1));
        }

        return octave;
    }

    KeyboardDown(key): void {

        //console.log(App.KeyboardInput.KeysDown);

        //Check if this key pressed is in out key_map
        //if (typeof this.KeyMap[key.keyCode] !== 'undefined') {

        //if it's already pressed (holding note)
        //if (key.keyCode in this.KeysDown) {
        //    return;
        //}
        ////pressed first time, add to object
        //this.KeysDown[key.keyCode] = true;

        //if (this.KeyMap[key.keyCode] == 'OctaveUp' && this.CurrentOctave < 9) {
        //    this.CurrentOctave++;
        //    return;
        //}
        //
        //if (this.KeyMap[key.keyCode] === 'OctaveDown' && this.CurrentOctave != 0) {
        //    this.CurrentOctave--;
        //    return;
        //}

        //var keyPressed = this.GetKeyNoteOctaveString(key.keyCode);
        var keyPressed = this.GetKeyNoteOctaveString(key);
        var frequency = this.GetFrequencyOfNote(keyPressed);

        //if (this.Settings.isPolyphonic){
        //    // POLYPHONIC
        //
        //    //TODO: Allow Object Pooling to construct Oscillators and Envelopes
        //
        //    var PooledOscillator: PooledOscillator = App.OscillatorsPool.GetObject();
        //
        //    PooledOscillator.Oscillator.setFrequency(frequency);
        //    PooledOscillator.Oscillator.setType(this.Modifiable.Settings.oscillator.waveform);
        //
        //    PooledOscillator.Envelope.set({
        //        attack: this.Modifiable.Settings.envelope.attack,
        //        decay: this.Modifiable.Settings.envelope.decay,
        //        sustain: this.Modifiable.Settings.envelope.sustain,
        //        release: this.Modifiable.Settings.envelope.release
        //    });
        //
        //    PooledOscillator.Oscillator.connect(this.Modifiable.OutputGain);
        //
        //    PooledOscillator.Oscillator.start();
        //    PooledOscillator.Envelope.triggerAttack();
        //
        //    this._nodes.push(PooledOscillator);
        //
        //    //TODO: make all effects work in polyphonic mode
        //
        //} else {
        // MONOPHONIC
        // If no other keys already pressed trigger attack
        if (Object.keys(this.KeysDown).length === 1) {
            if (this.Source.Source.frequency){
                this.Source.Source.frequency.exponentialRampToValueNow(frequency, 0);
            }
            this.Source.Envelope.triggerAttack();

            // Else ramp to new frequency over time (portamento)
        } else {
            if (this.Source.Source.frequency) {
                this.Source.Source.frequency.exponentialRampToValueNow(frequency, this.Settings.glide);
            }
        }
        //}
        //}

    }

    KeyboardUp(key): void {

        ////Check if this key released is in out key_map
        //if (typeof this.KeyMap[key.keyCode] !== 'undefined') {
        //    // remove this key from the keysDown object
        //    delete this.KeysDown[key.keyCode];

        var keyPressed = this.GetKeyNoteOctaveString(key);
        var frequency = this.GetFrequencyOfNote(keyPressed);

        //if (this.Settings.isPolyphonic) {
        //    // POLYPHONIC
        //    var new_nodes = [];
        //
        //    // Loop through oscillator voices
        //    for (var i = 0; i < this._nodes.length; i++) {
        //        var o = this._nodes[i];
        //        // Check if voice frequency matches the keyPressed frequency
        //        if (Math.round(o.Oscillator.frequency.getValue()) === Math.round(frequency)) {
        //
        //            o.Envelope.triggerRelease();
        //            o.Reset();
        //            o.ReturnToPool();
        //
        //        } else {
        //            new_nodes.push(o);
        //        }
        //    }
        //
        //    this._nodes = new_nodes;
        //
        //} else {
        // MONOPHONIC
        if (Object.keys(this.KeysDown).length === 0) {
            this.Source.Envelope.triggerRelease();
        }
        //}
        //}
    }

    GetKeyNoteOctaveString(keyCode): string {
        // Replaces keycode with keynote & octave string
        return (keyCode
            .replace('a', this.CurrentOctave)
            .replace('b', this.CurrentOctave + 1)
            .replace('c', this.CurrentOctave + 2)
            .replace('d', this.CurrentOctave + 3)
            .toString());
    }

    GetFrequencyOfNote(note): number {
        return this.Source.Source.noteToFrequency(note) * this.GetConnectedPitchPreEffects();
    }

    GetConnectedPitchPreEffects() {

        var totalPitchIncrement = 1;

        for (var i = 0; i < this.Source.Effects.Count; i++) {
            var mod = this.Source.Effects.GetValueAt(i);

            //TODO: Use reflection when available
            if ((<PitchComponent>mod).PitchIncrement) {
                var thisPitchIncrement = (<PitchComponent>mod).PitchIncrement;
                totalPitchIncrement *= thisPitchIncrement;
            }

        }

        return totalPitchIncrement;
    }

}

export = Keyboard;