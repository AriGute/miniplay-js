const fs = require('fs');
const path = require('path');
console.log('copy files...');

const args = process.argv.slice(2); // Exclude the first two elements
const env = args[0] === 'test' ? 'test' : args[0] === 'prod' ? 'prod' : null;

console.log('Arguments provided:', args);

const files = ['.npmignore', 'LICENSE.txt', 'package.json', 'README.txt'];
const srcDir = path.join(__dirname, 'package_config');
let rootDest = '';
switch (env) {
	case 'test':
		rootDest = path.join(__dirname, 'dist', 'build-test');
		break;
	case 'prod':
		rootDest = path.join(__dirname, '..', 'package');
		break;

	default:
		throw Error('Use env "test" or "prod"');
		break;
}
const destDir = path.join(rootDest);

// remove existing files
// if (fs.existsSync(destDir)) {
// 	console.log(`remove old files at: ${destDir}`);
// 	removeDirectory(destDir);
// }

if (validate()) {
	files.forEach((file) => {
		const src = path.join(srcDir, file);
		const dest = path.join(destDir, file);

		// Ensure dest directory exists
		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, { recursive: true });
		} else {
			fs.mkdirSync(path.dirname(dest), { recursive: true });
		}

		// Copy index.html
		fs.copyFileSync(src, dest);
		console.log(file, ' copied to dest folder.');
	});
}

function validate() {
	if (env == false) {
		throw Error('env is false.');
	}

	if (!fs.existsSync(srcDir)) {
		throw Error('srcDir not exist.');
	}

	files.forEach((file) => {
		const src = path.join(srcDir, file);
		// Ensure files exists
		if (!fs.existsSync(src)) {
			throw Error(`file ${file} is missing.`);
		}
	});

	return true;
}

function removeDirectory(directoryPath) {
	try {
		fs.rmSync(directoryPath, { recursive: true, force: true });
		console.log(`Directory '${directoryPath}' and its contents removed successfully.`);
	} catch (err) {
		console.error(`Error removing directory '${directoryPath}':`, err);
	}
}
