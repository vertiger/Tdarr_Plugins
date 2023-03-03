// Rules disabled for example purposes
/* eslint max-len: 0 */ // --> OFF
/* eslint no-unused-vars: 0 */ // --> OFF
/* eslint global-require: 0 */ // --> OFF
/* eslint import/no-extraneous-dependencies: 0 */ // --> OFF
/* eslint no-console: 0 */ // --> OFF
/* eslint no-param-reassign: 0 */ // --> OFF

const details = () => ({
  id: 'H0ae8ArPS',
  Stage: 'Pre-processing',
  Name: 'Tiered Handbrake H265 encode with audio and subtitles cleaning',
  Type: 'Video',
  Operation: 'Transcode',
  Description: `This plugin encodes h264 to h265 (mkv) with handbrake ,
                uses tiered bitrate celling,
                black bars are cropped,
                and removes unwanted audio and subtitle streams.\n\n`,
  Version: '1.00',
  Tags: 'handbrake,h265,qsv,video only', // Provide tags to categorise your plugin in the plugin browser.Tag options: h265,hevc,h264,nvenc h265,nvenc h264,video only,audio only,subtitle only,handbrake,ffmpeg,radarr,sonarr,pre-processing,post-processing,configurable

  Inputs: [],
});

// eslint-disable-next-line no-unused-vars
const plugin = (file, librarySettings, inputs, otherArguments) => {
  const lib = require('../methods/lib')();
  // load default plugin inputs
  inputs = lib.loadDefaultValues(inputs, details);

  // Must return following object at some point in the function else plugin will fail.
  const response = {
    processFile: false, // If set to false, the file will be skipped. Set to true to have the file transcoded.
    preset: '', // HandBrake/FFmpeg CLI arguments you'd like to use. '-Z "Very Fast 1080p30"'
    container: '.mkv', // The container of the transcoded output file.
    handBrakeMode: true, // Set whether to use HandBrake or FFmpeg for transcoding
    FFmpegMode: false,
    reQueueAfter: true,
    infoLog: '', // This will be shown when the user clicks the 'i' (info) button on a file in the output queue if it has been skipped.
  };

  // check if the file is a video, if not the plugin will exit
  if (file.fileMedium !== 'video') {
    response.infoLog += '☒ File is not a video! \n';
    return response;
  }
  response.infoLog += '☑ File is a video! \n';

  // only transcode h264
  if (file.ffProbeData.streams.some((x) => x.codec_name?.toLowerCase() === 'h264')) {
    response.infoLog += '☑ File has codec h264! \n';
  } else {
    response.infoLog += '☒ File has not codec h264! \n';
    return response;
  }
  // no transcode h264 10bit files
  if (file.ffProbeData.streams[0].profile === "High 10") {
    response.infoLog += '☒ Not processing h264 10bit files! \n';
    return response;
  }

  // recommened broadcast bitrates
  var tiered = {
    "480p":    750000,
    "576p":   1000000,
    "720p":   1500000,
    "1080p":  4000000,
    "4KUHD": 15000000,
  };

  // get the source bitrate
  var bitrate_probe = Math.min(Number(file.mediaInfo.track[1].BitRate), Number(file.mediaInfo.track[0].OverallBitRate));
  if (isNaN(bitrate_probe) || bitrate_probe === null || bitrate_probe === 0) {
    response.infoLog += '☒ Unable to get video bitrate, not processing! \n';
    return response;
  }

  // calculate target bitrate
  var bitrate_target = Math.floor(bitrate_probe / 2)
  var bitrate_limit = tiered[file.video_resolution]
  if (bitrate_target > bitrate_limit) {
    bitrate_target = bitrate_limit;
  } else {
    response.infoLog += '☒ Video bitrate below limit, not processing! \n';
    return response;
  }

  response.infoLog += `☑Found video bitrate ${bitrate_probe}, encode for ${bitrate_target}! \n`;
  bitrate_target = Math.floor(bitrate_target / 1000);   // hb takes bitrate as kbps

  response.preset = `--enable-qsv-decoding --preset-import-file "./qsv.json" --preset "qsv" --vb ${bitrate_target}`;
  response.processFile = true;

  return response;
};

module.exports.details = details;
module.exports.plugin = plugin;
