fx_version 'cerulean'

game 'gta5'
lua54 'yes'

shared_scripts {
	'@ox_lib/init.lua',
	'shared/*.lua',
}

server_scripts {
	'server/*.lua',
	'server/*.js'
}

client_scripts {
	'client/*.lua',
}

ui_page {
	'nui/ui.html'
}

files {
	'nui/ui.html',
	'nui/*.js',
}

dependencies {
	'ox_lib',
	'yarn'
	-- 'xsound' for 3d voice
}
