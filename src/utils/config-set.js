import { isVue2 } from '../vue'
import DEFAULTS from './config-defaults'
import cloneDeep from './clone-deep'
import { getRaw } from './get'
import { isArray, isPlainObject, isString, isUndefined } from './inspect'
import { getOwnPropertyNames, hasOwnProperty } from './object'
import { warn } from './warn'

// --- Constants ---

const NAME = 'BvConfig'
const PROP_NAME = '$bvConfig'

// Config manager class
class BvConfig {
  constructor() {
    // TODO: pre-populate with default config values (needs updated tests)
    // this.$_config = cloneDeep(DEFAULTS)
    this.$_config = {}
    this.$_cachedBreakpoints = null
  }

  /* istanbul ignore next */
  static get Defaults() /* istanbul ignore next */ {
    return DEFAULTS
  }

  /* istanbul ignore next */
  get defaults() /* istanbul ignore next */ {
    return DEFAULTS
  }

  // Returns the defaults
  /* istanbul ignore next */
  getDefaults() /* istanbul ignore next */ {
    return this.defaults
  }

  // Method to merge in user config parameters
  setConfig(config = {}) {
    if (!isPlainObject(config)) {
      /* istanbul ignore next */
      return
    }
    const configKeys = getOwnPropertyNames(config)
    configKeys.forEach(cmpName => {
      /* istanbul ignore next */
      if (!hasOwnProperty(DEFAULTS, cmpName)) {
        warn(`Unknown config property "${cmpName}"`, NAME)
        return
      }
      const cmpConfig = config[cmpName]
      if (cmpName === 'breakpoints') {
        // Special case for breakpoints
        const breakpoints = config.breakpoints
        /* istanbul ignore if */
        if (
          !isArray(breakpoints) ||
          breakpoints.length < 2 ||
          breakpoints.some(b => !isString(b) || b.length === 0)
        ) {
          warn('"breakpoints" must be an array of at least 2 breakpoint names', NAME)
        } else {
          this.$_config.breakpoints = cloneDeep(breakpoints)
        }
      } else if (isPlainObject(cmpConfig)) {
        // Component prop defaults
        const props = getOwnPropertyNames(cmpConfig)
        props.forEach(prop => {
          /* istanbul ignore if */
          if (!hasOwnProperty(DEFAULTS[cmpName], prop)) {
            warn(`Unknown config property "${cmpName}.${prop}"`, NAME)
          } else {
            // TODO: If we pre-populate the config with defaults, we can skip this line
            this.$_config[cmpName] = this.$_config[cmpName] || {}
            if (!isUndefined(cmpConfig[prop])) {
              this.$_config[cmpName][prop] = cloneDeep(cmpConfig[prop])
            }
          }
        })
      }
    })
  }

  // Clear the config. For testing purposes only
  resetConfig() {
    this.$_config = {}
  }

  // Returns a deep copy of the user config
  getConfig() {
    return cloneDeep(this.$_config)
  }

  getConfigValue(key) {
    // First we try the user config, and if key not found we fall back to default value
    // NOTE: If we deep clone DEFAULTS into config, then we can skip the fallback for get
    return cloneDeep(getRaw(this.$_config, key, getRaw(DEFAULTS, key)))
  }
}

// Method for applying a global config
export const setConfig = (app, config = {}) => {
  // Get/Create the current config
  const bvConfig =
    (isVue2 ? app.prototype[PROP_NAME] : app.config.globalProperties[PROP_NAME]) || new BvConfig()

  // Apply the config values
  bvConfig.setConfig(config)

  // Re-assign the config
  if (isVue2) {
    app.prototype[PROP_NAME] = bvConfig
  } else {
    app.config.globalProperties[PROP_NAME] = bvConfig
  }
}
