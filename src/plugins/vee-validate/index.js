import { defineRule, ErrorMessage, Field, Form } from 'vee-validate'
import * as AllRules from '@vee-validate/rules'

import { defineCustomRules } from './customRules'
export const veeValidatePlugin = {
  install: (app) => {
    app.component('VeeForm', Form)
    app.component('VeeField', Field)
    app.component('ErrorMessage', ErrorMessage)

    Object.keys(AllRules).forEach((rule) => {
      defineRule(rule, AllRules[rule])
    })

    defineCustomRules()
  }
}
