// Rules disabled for example purposes
/* eslint max-len: 0 */ // --> OFF
/* eslint no-unused-vars: 0 */ // --> OFF
/* eslint global-require: 0 */ // --> OFF
/* eslint import/no-extraneous-dependencies: 0 */ // --> OFF
/* eslint no-console: 0 */ // --> OFF
/* eslint no-param-reassign: 0 */ // --> OFF

const details = () => ({
  id: "o0NCR-vTz",
  Stage: 'Post-processing', // Preprocessing or Post-processing. Determines when the plugin will be executed. This plugin does some stuff after all plugins have been executed
  Name: 'Tdarr_Plugin_SML_PROPEDIT_PostFix',
  Type: 'Video',
  Operation: 'Transcode',
  Description: 'Update media statistics after the file has been processed. \n\n',
  Version: '1.00',
  Tags: 'Post-processing,mkvpropedit', // Tag options: h265,hevc,h264,nvenc h265,nvenc h264,video only,audio only,subtitle only,handbrake,ffmpeg,radarr,sonarr,pre-processing,post-processing,configurable

  Inputs: [],
});

// eslint-disable-next-line no-unused-vars
const plugin = (file, librarySettings, inputs, otherArguments) => {
  const lib = require('../methods/lib')();
  var proc = require("child_process");
  
  // load default plugin inputs
  inputs = lib.loadDefaultValues(inputs, details);

  // Optional response if you need to modify database
  const response = {
    file,
    removeFromDB: false,
    updateDB: true,
  };

  if (file.container !== "mkv") {
    return response;
  }

  var output = "";
  try {
    output = proc.execSync(`mkvpropedit --add-track-statistics-tags "${currentFileName}"`);
  } catch(err) {
	response.infoLog += output;
  }

  return response;
};
module.exports.details = details;
module.exports.plugin = plugin;