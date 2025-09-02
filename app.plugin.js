const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withCleartextWs(config) {
  // Ensure manifest attributes
  config = withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (app) {
      app.$['android:usesCleartextTraffic'] = 'true';
      app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    }
    return config;
  });

  // Copy network_security_config.xml into android res on prebuild
  config = withDangerousMod(config, [
    'android',
    (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const src = path.join(projectRoot, 'android-res', 'xml', 'network_security_config.xml');
      const destDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'res',
        'xml'
      );
      const dest = path.join(destDir, 'network_security_config.xml');
      try {
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, dest);
      } catch (e) {
        console.warn('network_security_config copy failed:', e?.message);
      }
      return config;
    },
  ]);

  // Append ProGuard rules to keep OkHttp/okio if proguard-rules.pro exists
  config = withDangerousMod(config, [
    'android',
    (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const src = path.join(projectRoot, 'android-res', 'proguard-rules.pro');
      const appProguard = path.join(
        projectRoot,
        'android',
        'app',
        'proguard-rules.pro'
      );
      try {
        if (fs.existsSync(src)) {
          const content = fs.readFileSync(src, 'utf8');
          fs.appendFileSync(appProguard, `\n\n# Added by app.plugin.js\n${content}`);
        }
      } catch (e) {
        console.warn('Appending ProGuard rules failed:', e?.message);
      }
      return config;
    },
  ]);

  return config;
};
