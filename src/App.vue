<template>
  <div id="app">
    <div id="title-instrument-selector">
      <div id="title">
        <h1>Instrument Tuner</h1>
      </div>
      <div id="instrument-select">
        <div class="flex-center">
          <label for="instrument-select-input">Instrument:</label>
          <select id="instrument-select input" v-model="instrument">
            <option :value="null"></option>
            <option v-for="instrument in instruments" :key="instrument.name" :value="instrument">{{instrument.name}}</option>
          </select>
        </div>
        <div v-if="instrument" class="flex-center">
          <label for="tuning-select-input">Tuning:</label>
          <select id="tuning-select-input" v-model="tuning" >
            <option v-for="tuning in instrument.tunings" :key="tuning.name" :value="tuning">{{tuning.name}}</option>
          </select>
        </div>
      </div>
    </div>
    <div id="note-buttons">
      <div id="all-notes" v-if="!instrument">
        <button v-for="note in notes" :id="note.name" class="note click flex-center;" :key="note.name" :style="buttonDimensions" :class="{'latched' : note.name + octave === latch}" @click="playNote(note.name + octave)">
          {{note.name}}
        </button>
      </div>
      <div id="tuned-notes" class="flex-center" v-else>
        <button v-for="note in tuning.notes" :id="note" class="note click" :key="note" :class="{'latched' : note === latch}" @click="playNote(note)">{{note}}</button>
      </div>
    </div>
    <div id="options" style="margin-bottom: 15px;" :style="{fontSize}">
      <div id="octave-selector">
        <span>Octave: {{octave}}</span>
        <el-slider
          v-model="octave"
          vertical
          :min="1"
          :max="6"
          :show-tooltip="false"
          :height="(((dimensions.height)/6) * 0.5) - 5 + 'px'">
        </el-slider>
      </div>
      <div id="note-length">
        <span>{{noteLatch ? 'Let note ring' : 'Note Length'}}</span>
        <el-slider
          v-model="length"
          vertical
          :min="0"
          :max="4"
          :show-tooltip="false"
          :height="(((dimensions.height)/6) * 0.5) - 5 + 'px'">
        </el-slider>
      </div>
      <div id="volume">
        <div>
          <span>Volume: </span><span>{{0 - calcLogScale(volume).toFixed(0)}}db</span>
        </div>
        <el-slider
          v-model="volume"
          vertical
          :min="1"
          :max="100"
          :show-tooltip="false"
          :height="(((dimensions.height)/6) * 0.5) - 5 + 'px'">
        </el-slider>
      </div>
    </div>
  </div>
</template>

<script>
import Tone from 'tone'
import Tunings from '@/tunings'
export default {
  name: 'app',
  components: {

  },
  mixins: [ Tunings ],
  data () {
    return {
      notes: [
          {
            name: 'C'
          },
          {
            name: 'C#'
          },
          {
            name: 'D'
          },
          {
            name: 'D#'
          },
          {
            name: 'E'
          },
          {
            name: 'F'
          },
          {
            name: 'F#'
          },
          {
            name: 'G'
          },
          {
            name: 'G#'
          },
          {
            name: 'A'
          },
          {
            name: 'A#'
          },
          {
            name: 'B'
          }
      ],
      octave: 3,
      synth: {},
      noteLatch: false,
      latch: null,
      noteLengths: ['8n', '4n', '2n', '1n', 'latch'],
      length: 1,
      volume: 40,
      instrument: null,
      tuning: null,
      windowWidth: 0,
      windowHeight: 0
    }
  },
  methods: {
    handleResize () {
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
    },
    calcLogScale(val) {
  // position will be between 0 and 100
        var minp = 100
        var maxp = 1

        // The result should be between 100 an 10000000
        var minv = 10
        var maxv = 60
        // calculate adjustment factor
        var scale = (maxv-minv) / (maxp-minp)

        return minv + scale*(val-minp)
    },
    createSynth () {
      this.synth = new Tone.MonoSynth().toMaster()
      this.synth.oscillator.type = 'sine'
      this.synth.volume.value = -20
    },
    octaveChange (dir) {
      this.octave += dir
      if (this.octave === 0) {
        this.octave = 1
      }
      if (this.octave === 7) {
        this.octave = 6
      }

    },
    playNote (note) {
      if (this.noteLatch) {
        if (this.latch && this.latch === note) {
          this.latch = ''
          this.synth.triggerRelease()
        } else {
          this.latch = note
          this.synth.triggerAttack(note)
        }
      } else {
        this.latch = ''
        this.synth.triggerAttackRelease(note, this.noteLengths[this.length])
      }
    }
  },
  computed: {
    fontSize () {
      return this.dimensions.width < 768 ? '12px' : '24px'
    },
    currentLength() {
      return this.noteLengths[this.length]
    },
    dimensions () {
      return {
        width: this.windowWidth,
        height: this.windowHeight
      }
    },
    buttonDimensions() {
      return {
        width: (this.dimensions.width / 3) + 'px',
        height: (((this.dimensions.height / 6) / 4) * 4) + 'px'
      }
    },
    currentNotes () {
      return this.instrument
    }
  },
  watch: {
    volume: {
      handler (newVal) {
        this.synth.volume.value = 0 - this.calcLogScale(newVal).toFixed(2)
      }
    },
    instrument: {
      handler (newVal) {
        if (newVal) {
          this.tuning = this.instrument.tunings[0]
        }
      }
    },
    currentLength: {
      handler (newVal) {
        if (newVal && newVal === 'latch') {
          this.noteLatch  = true
        } else if (newVal) {
          this.noteLatch = false
        }
      }
    }
  },
  created () {
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
  },
  mounted () {
    this.createSynth ()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
  }
}

</script>

<style lang="scss">
@import '../static/scss/main.scss';
#app {
  #title {
    text-align: center;
  }
  #instrument-select {
    font-size: 20px;
    div {
      padding: 15px;
      select {
        width: 200px;
        border-radius: 5px;
        font-size: inherit;
        padding: 10px;
      }
    }
  }
  overflow: hidden;
  *{
    font-family: inherit;
  }
  font-family: 'Nova Flat', cursive;
  width: 100%;
  height: 100%;
  display:grid;
  grid-template-rows: 1fr 4fr 1fr;
  #note-buttons {
    font-size: 48px;
    display: flex;
    justify-content: space-around;
    div {
      flex: 1;
    }
    #all-notes {
      width: 100%;
      height:100%;
      .note {
        font-family: 'Nova Flat', cursive;
        font-size: inherit;
        align-self: center;
        justify-self: center;
        border: none;
        transform: scale(1);

        transition: all 0.3s ease;
        &:hover {
        }
        &:focus {
          outline: none;
        }
        &:active {
          outline: none;
        }
        &.latched {
          box-shadow: 0 0 25px orange;
          z-index:2;
          background: orange !important;
          animation: latchPulse 1s infinite;
          animation-direction: alternate;
        }
      }
    }
    #tuned-notes {
      display: flex;
      flex-direction: column;
      .note {
        border: none;
        margin: 3px;
        flex: 1;
        width: 100%;
        font-size: inherit;
        &.latched {
          box-shadow: 0 0 25px orange;
          z-index:100;
          background: orange !important;
          animation: latchPulse 1s infinite;
          animation-direction: alternate;
        }
      }
    }
  }
  #options {
    width: 100%;
    display: flex;
    font-family: 'Source Code Pro', monospace;
    &>div {
      justify-content: space-around;
      display: inline-flex;
      align-items: center;
      flex: 1;
      flex-direction: column;
      span {
        margin: 2px;
        margin-bottom: 10px;
        padding: 3px;
      }
    }
  }
}
.click {

  &:hover {
    cursor: pointer;
  }
}
.el-slider__button {
  border: 1px solid black;
  background: #101010;
}
.el-slider__bar {
  background: #101010;
}
.flex-center {
  display:flex;
  align-items: center;
  justify-content: center;
}
.flex-space-bet {
  display:flex;
  align-items: center;
  justify-content: space-evenly;
}
.note {
  background: #101010;
  color: #f2f2f2;
  &:focus {
    outline: none;
    background: #101010;

  }
  &:active {
    outline: none;
    background: #101010;
    transform: scale(0.8) !important;
    box-shadow: 0 0 25px orange;
    z-index:100;
    background: orange !important;
  }
}

@keyframes latchPulse {
  from { transform: scale(1);}
  to { transform: scale(0.8);}
}

@media screen and (max-width: 768px) {
  #all-note {
    grid-template-rows: repeat(4, 1fr);
    grid-template-columns: repeat(3, 1fr);
  }
}
@media screen and (min-width: 768px) {
  #all-note {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
}
</style>
