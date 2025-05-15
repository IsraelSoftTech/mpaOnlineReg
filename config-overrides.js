module.exports = function override(config, env) {
  // Disable source maps for react-minimal-pie-chart
  config.module.rules.push({
    test: /\.js$/,
    enforce: 'pre',
    use: ['source-map-loader'],
    exclude: /react-minimal-pie-chart/,
  });
  
  return config;
}; 