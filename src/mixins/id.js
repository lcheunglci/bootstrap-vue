// SSR safe client-side ID attribute generation
// ID's can only be generated client-side, after mount
// `this._uid` is not synched between server and client
import { defineComponent } from '../vue'

// @vue/component
export default defineComponent({
  props: {
    id: {
      type: String
      // default: null
    }
  },
  data() {
    return {
      localId_: null
    }
  },
  computed: {
    safeId() {
      // Computed property that returns a dynamic function for creating the ID
      // Reacts to changes in both `.id` and `.localId_` and regenerates a new function
      const id = this.id || this.localId_

      // We return a function that accepts an optional suffix string
      // So this computed prop looks and works like a method
      // but benefits from Vue's computed prop caching
      const fn = suffix => {
        if (!id) {
          return null
        }
        suffix = String(suffix || '').replace(/\s+/g, '_')
        return suffix ? id + '_' + suffix : id
      }
      return fn
    }
  },
  mounted() {
    // `mounted()` only occurs client-side
    this.$nextTick(() => {
      // Update DOM with auto-generated ID after mount
      // to prevent SSR hydration errors
      this.localId_ = `__BVID__${this._uid}`
    })
  }
})
