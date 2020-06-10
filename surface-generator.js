/**
 * Surface generation using the 'av' surface type in NGL.
 * 
 * 3 Modes are required:
 * 
 *   1. Just the surface
 *   2. Vertex values using an ESP grid (e.g. a .dx file from QChem)
 *   3. Vertex values using charges from a PQR file, applying Sum(q/r**2)
 * 
 */

const _ = require('browser-env')()

var fs = require('fs').promises
var NGL = require('./ngl.dev.js')

var SURF_PARAMS = {
  type: 'av',
  contour: false,
  scaleFactor: 4.0,
  probeRadius: 1.4,
  radiusParams: {type: 'explicit'},
  smooth: 0
}

async function loadFile (fname) {
  try {
    const data = await fs.readFile(fname)
    const f = new File([data], fname)
    return NGL.autoLoad(f)
  } catch (error) {
    console.error("Could not read file: ", fname)
  }
}  

function run (pqrPath, outPath, options) {

  const uValues = options.uvalues
  const vValues = options.vvalues
  const vScale = options.vscale
  const uScale = options.uscale

  const components = []
  
  components.push(loadFile(pqrPath))
  if (uValues === undefined) {
    components.push(components[0]) // Same component
  } else {
    components.push(loadFile(uValues))
  }

  
  if (vValues !== undefined) {
    components.push(loadFile(vValues))
  }

  console.log("Awaiting ", components.length, "promises")
  var p = Promise.all(components).then(a => {
    const pqr = a[0]
    const molsurf = new NGL.MolecularSurface(pqr)
    const surf = molsurf.getSurface(SURF_PARAMS)

    let uValue = undefined
    const uComponent = a[1] // Shouldn't be undef..
    if (uComponent !== undefined && (uComponent.type === 'Volume' || uComponent.type === 'Structure')) {
      uValue = uComponent
    }

    let vValue = undefined
    const vComponent = a[2] // Quite possibly undef
    if (vComponent !== undefined && (vComponent.type === 'Volume' || vComponent.type === 'Structure')) {
      vValue = vComponent
    }

    const p = { uValue, vValue, uScale, vScale, normals: false, precision: 5 }

    const writer = new NGL.TMeshWriter(surf, p)
    if (outPath !== undefined) {
      fs.writeFile(outPath, writer.getData())
    } else {
      process.stdout.write(writer.getData()) 
    }
    
  }).catch((reason) => {
    console.error(reason)
  })

  return p
}

module.exports = {
  run, loadFile
}
