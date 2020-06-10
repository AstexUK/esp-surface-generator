#!/usr/bin/env node
var program = require('commander')
var surfgen = require('./surface-generator.js')

program
    .version('0.2')
    
    .description(
       'Calculate ESP surfaces from the ESP_DNN method.\n' +
       'Requires a structure file (typically PQR) as input.\n' + 
       'In the usual case (partial charges in a pqr file) the output ESP values are in kcal/mol unless scaled with --uscale or --vscale parameters.\n' +
       'If interpolating an ESP grid (e.g. from a QM calculation) output ESP values are in the same units as the input grid (unless scaled).\n' +
       'The output file is in \'tmesh\' format, see README.md',
      { 'pqrfile' : 'The structure to generate a surface for', 'output': 'The output file, in tmesh format' }
    )
    .arguments('<pqrfile> <output>')
    .option('-u,--uvalues <path>', 'The file (ESP grid or structure with partial charges) used to calculate potential in the u column. If not supplied will attempt to use the partial charges on the input molecule')
    .option('--uscale <number>', 'Constant scaling to apply to u values. Defaults to 1.0', '1.0')
    .option('-v,--vvalues <path>', 'The file (ESP grid or structure with partial charges) used to calculate potential in the v column. IF not supplied will not calculate anything for the v column')
    .option('--vscale <number>', 'Constant scaling to apply to v values. Defaults to 1.0', '1.0')
    .action( function(pqr, output, options) {
        surfgen.run(pqr, output, options)
    }).parse(process.argv)
