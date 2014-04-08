fs = require \fs

params = process.argv.slice 2

unless params.length >= 2
	console.log 'format: node genCerKey {input file} {output name}'
	process.exit 1


from 	= params[0]
to 		= params[1]

console.log "!!!! #from -> #{to}-cer.pem + #{to}-key.pem"

seperator = '-----END CERTIFICATE-----'

fs.readFile from,'utf8',(e,content) !->
	if e
		return console.log e.code,e.path

	index = content.indexOf seperator

	if ~index
		index += seperator.length + 1
	else
		console.log "$from is not a proper pem"
		process.exit 1

	cer = content.substr 0,index
	key = content.substr index

	# console.log cer
	# console.log key

	if fs.writeFileSync "#{to}-cer.pem",cer or fs.writeFileSync "#{to}-key.pem",key
		console.log 'error'
	else
		console.log 'done'
