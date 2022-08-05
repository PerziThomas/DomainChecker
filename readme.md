# Domain Checker
## Usage

Call from the commandline using `node index.js pathToNames seperator pathToTlds`, with names being a csv file containing
a list of data, with any amount of columns. Seperator is the csv seperator, for example ";" or ",". Tlds is a file which
contains Top-Level-Domains in a format seperated by commas, eg "com, net, org".

Example files are provided in the example folder.

## What does it do?
The script checks each of the combinations of the data provided in the csv file with each of the top level domains in the second file using the who.is api. If there is an active website on this end will then be printed out in the table.md
file, which is a good indication on if a domain is available for purchase, but might not be 100% correct in all cases.