export declare let config: {
    graphics: {
        targetResolution: {
            width: number;
            height: number;
        };
        scaledResolution: {
            width: number;
            height: number;
        };
        imageSmoothing: boolean;
        imageSmoothingQuality: string;
        tileMap: {
            tileSize: number;
            diagonalPathFinding: boolean;
        };
        targetAnimationFrameRate: number;
        targetScreenRefreshRate: number;
        backGroundColor: string;
        textStyle: {
            default_font: string;
            default_size: number;
            default_color: string;
            default_max_length: number;
        };
    };
    network: {
        webRTC: boolean;
        webSocketIp: string;
        targetNetworkTicks: number;
    };
    targetUpdateTicks: number;
    debugMode: {
        debugGameScene: boolean;
        logs: {
            animationFrames: boolean;
            tabFocus: boolean;
            connection: boolean;
            tileMap: boolean;
            player: boolean;
        };
        Inspector: boolean;
        tileMap: boolean;
        pathFinding: boolean;
        ignoreCollision: boolean;
        drawCollider: boolean;
        drawClickAbles: boolean;
    };
};
//# sourceMappingURL=config.d.ts.map