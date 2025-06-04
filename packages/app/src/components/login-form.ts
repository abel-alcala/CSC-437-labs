import {css, html, LitElement} from "lit";
import {property, state} from "lit/decorators.js";

interface LoginFormData {
    username?: string;
    password?: string;
}

export class LoginFormElement extends LitElement {

    @state()
    formData: LoginFormData = {};

    @property()
    api?: string;

    @property()
    redirect: string = "/app";

    @state()
    error?: string;

    @state()
    private loading = false;



    get canSubmit(): boolean {
        return Boolean(this.api && this.formData.username &&
            this.formData.password);
    }

    override render() {
        return html`
            <form
                    @change=${(e: InputEvent) => this.handleChange(e)}
                    @submit=${(e: SubmitEvent) => this.handleSubmit(e)}
            >
                <slot></slot>
                <slot name="button">
                    <button ?disabled=${!this.canSubmit || this.loading} type="submit">
                        ${this.loading ? 'Loading…' : 'Login'}
                    </button>
                </slot>
                <p class="error">${this.error}</p>
            </form>
        `;
    }

    static styles = css`
        .error:not(:empty) {
            color: red;
            border: 1px solid red;
            padding: 10px;
            margin-top: 10px;
            border-radius: 4px;
        }
    `;

    handleChange(event: InputEvent) {
        const target = event.target as HTMLInputElement;
        const name = target?.name;
        const value = target?.value;
        const prevData = this.formData;

        switch (name) {
            case "username":
                this.formData = {...prevData, username: value};
                break;
            case "password":
                this.formData = {...prevData, password: value};
                break;
        }
    }

    handleSubmit(submitEvent: SubmitEvent) {
        submitEvent.preventDefault();

        if (this.canSubmit) {
            this.loading = true;
            fetch(
                this?.api || "",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(this.formData)
                }
            )
                .then((res) => {
                    if (res.status !== 200)
                        throw new Error("Login failed");
                    else return res.json();
                })
                .then((json: object) => {
                    const {token} = json as { token: string };
                    const customEvent = new CustomEvent(
                        'auth:message', {
                            bubbles: true,
                            composed: true,
                            detail: [
                                'auth/signin',
                                {token, redirect: this.redirect}
                            ]
                        });
                    console.log("dispatching message", customEvent);
                    this.dispatchEvent(customEvent);
                })
                .catch((error: Error) => {
                    console.log(error);
                    this.error = error.toString();
                })
                .finally(() => this.loading = false);
        }
    }
}