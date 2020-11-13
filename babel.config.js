module.exports = function (api) {
  api.cache(false)
  return {
    "presets": [
      [
        '@vue/babel-preset-jsx',
        {
          vModel: false,
          compositionAPI: false,
        },
      ],
      // [
      //   "@babel/preset-react",
      //   {
      //     "pragma": "h"
      //   }
      // ]
    ],
    "plugins": [
      [
        "@babel/plugin-proposal-decorators",
        {
          "legacy": true
        }
      ],
      [
        "@babel/plugin-proposal-class-properties",
        {
          "loose": true
        }
      ],
    ]
  }
}
