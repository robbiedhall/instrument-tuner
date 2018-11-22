export default {
  data(){
    return {
      instruments:[
        {
          name: 'Guitar',
          tunings: [
            {
              name: 'Standard',
              notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
            }
          ]
        },
        {
          name: 'Bass',
          tunings: [
            {
              name: 'Standard',
              notes: ['E1', 'A1', 'D2', 'G2']
            }
          ]
        },
        {
          name: 'Ukulele',
          tunings: [
            {
              name: 'Standard',
              notes: ['G4', 'C4', 'E4', 'A4']
            }
          ]
        }
      ]
    }
  }
}
