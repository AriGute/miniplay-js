export let config = {
	graphics: {
		targetResolution: {
			width: 360,
			height: 180,
		},
		scaledResolution: {
			width: 1600,
			height: 900,
		},
		imageSmoothing: false,
		imageSmoothingQuality: 'high',
		tileMap: {
			tileSize: 36,
			diagonalPathFinding: true,
		},
		targetAnimationFrameRate: 12,
		targetScreenRefreshRate: 60, // 60
		backGroundColor: 'rgb(22,22,22,255)',
		textStyle: {
			default_font: 'sans-serif',
			default_size: 20,
			default_color: 'white',
			default_max_length: 10000,
		},
	},
	network: {
		webRTC: false,
		webSocketIp: 'ws://localhost:8080',
		targetNetworkTicks: 30, // 30
	},
	targetUpdateTicks: 60, // 60
	debugMode: {
		debugGameScene: false,
		logs: {
			animationFrames: false,
			tabFocus: false,
			connection: false,
			tileMap: false,
			player: false,
		},
		Inspector: false,
		tileMap: false,
		pathFinding: false,
		ignoreCollision: false,
		drawCollider: false,
		drawClickAbles: false,
	},
};
