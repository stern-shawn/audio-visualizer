const numNodes = 16
const audioCtx = new AudioContext()
const data = new Uint8Array(numNodes * 2)

const analyserNode = new AnalyserNode(audioCtx, {
  fftSize: Math.max(numNodes, 32),
  maxDecibels: -20,
  minDecibels: -80,
  smoothingTimeConstant: 0.8,
})

const volume = <HTMLElement>document.getElementById('volume')
const elVisualizer = <HTMLElement>document.querySelector('.visualizer')

const elNodes = Array.from({ length: numNodes }, (v, i) => {
  const node = document.createElement('div')
  node.className = 'node'
  elVisualizer.appendChild(node)

  return node
})

const updateVisualizer = () => {
  requestAnimationFrame(updateVisualizer)

  // Put FFT frequency data into our array
  analyserNode.getByteFrequencyData(data)

  elNodes.forEach((node, i) => {
    // Render the amplitude of current frequency and tint color
    node.style.setProperty('--color', `${data[i]}`)
    node.style.setProperty('--level', `${data[i] / 255}`)
  })
}

// Initiate the process of prompting the user for permission to access their audio, creating a 'source', and feeding
// that source into the analyser node so we can get cool FFT data, etc
const startStream = async () => {
  const audioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  })

  const source = await audioCtx.createMediaStreamSource(audioStream)
  source.connect(analyserNode)
  updateVisualizer()
}

// Let the user start things via a click event
document.addEventListener('click', () => {
  // We need to programatically resume the audio stream if we do it this way on click
  // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
  audioCtx.resume()
  startStream()
})
