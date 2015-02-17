import Effect = require("../Effect");
import ISource = require("../ISource");
import Grid = require("../../Grid");

class Pitch extends Effect {

    public PitchIncrement: number;

    constructor(grid: Grid, position: Point){

        this.PitchIncrement = 1.5; // Pitch decreases by 4ths

        super(grid, position);
        // Define Outline for HitTest
        this.Outline.push(new Point(-1, 0),new Point(0, -1),new Point(2, -1),new Point(0, 1));
    }

    Draw() {
        super.Draw();
        this.Grid.BlockSprites.Draw(this.Position,true,"pitch");
    }

    Delete(){
        this.PitchIncrement = null;
    }

    Attach(source: ISource): void {
        super.Attach(source);
        this.UpdatePitch(source);
    }

    Detach(source: ISource): void{
        super.Detach(source);
        this.UpdatePitch(source);
    }

    UpdatePitch(source: ISource): void{
        //OSCILLATORS
        if (source.Frequency){
            source.Source.frequency.exponentialRampToValueNow(source.Frequency * this._GetConnectedPitchPreEffects(source), 0);

            // TONE.PLAYERS
        } else if (source.Source._playbackRate){
            source.Source.setPlaybackRate(source.PlaybackRate * this._GetConnectedPitchPreEffects(source), 0);

            // GRANULAR
        } else if (source.Grains) {
            for (var i=0; i<source.MaxDensity; i++) {
                source.Grains[i].setPlaybackRate(source.PlaybackRate * this._GetConnectedPitchPreEffects(source), 0);
            }

            // RECORDER
        } else if (source.RecordedAudio) {
            source.RecordedAudio.setPlaybackRate(source.PlaybackRate * this._GetConnectedPitchPreEffects(source), 0);
        }

    }

    SetValue(param: string,value: number) {
        super.SetValue(param,value);
        var jsonVariable = {};
        jsonVariable[param] = value;

        if (param == "pitchMultiplier") {
            this.PitchIncrement = value;

            if (this.Sources.Count) {
                for (var i = 0; i < this.Sources.Count; i++) {
                    var source = this.Sources.GetValueAt(i);

                    this.UpdatePitch(source);
                }
            }
        }
    }

    GetValue(param: string) {
        super.GetValue(param);
        var val;

        if (param == "pitchMultiplier") {
            val = this.PitchIncrement;
        }
        return val;
    }

    OpenParams() {
        super.OpenParams();

        this.ParamJson =
        {
            "name" : "Pitch",
            "parameters" : [

                {
                    "type" : "slider",
                    "name" : "Pitch",
                    "setting" :"pitchMultiplier",
                    "props" : {
                        "value" : this.GetValue('pitchMultiplier'),
                        "min" : 0.5,
                        "max" : 2,
                        "quantised" : false,
                        "centered" : true,
                        "logarithmic": true
                    }
                }
            ]
        };
    }

    private _GetConnectedPitchPreEffects(source) {

        var totalPitchIncrement: number = 1;

        for (var i = 0; i < source.Effects.Count; i++) {
            var effect = source.Effects.GetValueAt(i);

            if ((<Pitch>effect).PitchIncrement) {
                var thisPitchIncrement = (<Pitch>effect).PitchIncrement;
                totalPitchIncrement *= thisPitchIncrement;
            }
        }

        return totalPitchIncrement;
    }
}

export = Pitch;