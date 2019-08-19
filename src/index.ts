const numNodes = 16 // # of frequency bands
const audioCtx = new AudioContext()
const data = new Uint8Array(numNodes * 2)

// Create an analyser node which pipes in the audio context and can be called to get FFT data at any instant in time.
// FFT quality determined by the config values. Has no effect on downstream nodes in case we want to add effects later
const analyserNode = new AnalyserNode(audioCtx, {
  fftSize: Math.max(numNodes, 32),
  maxDecibels: -20,
  minDecibels: -80,
  smoothingTimeConstant: 0.8,
})

const elVisualizer = <HTMLElement>document.querySelector('.visualizer')

// Create a series of nodes (one per frequency band) and keep their references so we can continually animate them
const elNodes = Array.from({ length: numNodes }, (_, i) => {
  const node = document.createElement('div')
  node.className = 'node'
  node.style.setProperty('--i', `${i}`)
  elVisualizer.appendChild(node)

  return node
})

const updateVisualizer = () => {
  // Keep it ~60fps 💸
  requestAnimationFrame(updateVisualizer)

  // Get current FFT frequency data and stash it in our Uint8Array
  analyserNode.getByteFrequencyData(data)

  elNodes.forEach((node, i) => {
    // Render the amplitude of the current frequency, attempting a log-ish scale for sensitivity to higher registers as
    // they drop off sooner. For style points lets also adjust the red tint of the bar based on amplitude.
    node.style.setProperty('--level', `${(data[i] / 255) * (1 + i / numNodes)}`)
    node.style.setProperty('--color', `${data[i]}`)
  })
}

// Initiate the process of prompting the user for permission to access their audio, creating a 'source', and feeding
// that source into the analyser node so we can get cool FFT data, etc. Finally, kick off the requestAnimationFrame loop
const startStream = async () => {
  const audioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  })

  const source = await audioCtx.createMediaStreamSource(audioStream)
  source.connect(analyserNode)
  updateVisualizer()
}

// Let the user consent to having their audio intercepted via a click event
document.addEventListener('click', () => {
  // We need to programatically resume the audio stream if we do it this way on click
  // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
  audioCtx.resume()
  startStream()
})
