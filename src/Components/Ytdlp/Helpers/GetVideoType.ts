export enum VideoType {
    Clip = "Clip",
    Playlist = "Playlist",
    Livestream = "Livestream",
    Video = "Video"
}

export default function GetVideoType(videoUrl: string): VideoType | null {
    const patterns: [RegExp, VideoType][] = [
        [/https?:\/\/(www\.)?youtube\.com\/clip\//, VideoType.Clip],
        [/https?:\/\/(www\.)?youtube\.com\/playlist\?list=/, VideoType.Playlist],
        [/https?:\/\/(www\.)?youtube\.com\/watch\?v=[^&]+&live/, VideoType.Livestream],
        [/https?:\/\/(www\.)?youtube\.com\/watch\?v=/, VideoType.Video]
    ];

    for (const [pattern, type] of patterns) {
        if (pattern.test(videoUrl)) {
            return type;
        }
    }
    return null;
}