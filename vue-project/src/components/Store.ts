import {defineStore} from "pinia";

export const globalVariableStorage = defineStore("globalVariableStorage", {
        state: () => ({
            authToken: false
        }),
        getters: {
            getAuthTokenState: state => !!state.authToken
        },
        actions: {
            setFalse() {
                this.authToken = false
            },
            setTrue() {
                this.authToken = true
            }
        }
    }
)