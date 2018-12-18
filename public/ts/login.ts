import * as common from "./common"
declare var UIkit: any;

function showSuccess(message: string) {
	UIkit.notification(message, {timeout: 0, status: "success"});
}

function showError(message: string) {
    UIkit.notification(message, {timeout: 0, status: "danger"});
}

function login_via_single_use_link(tag: string, redirect: string) {
	const apiBasePath = window.apiBasePath;

    const data: any = {user_tag: tag};
    if (redirect) {
        data['redirect'] = redirect;
    }
	
    common.ajax("POST", apiBasePath + "/member/send_access_token", data)
    .then(json => {
    	// Yay, success, refresh page
    	if (json.status === "sent") {
            showSuccess("Ett mail har skickats till dig med en inloggningslänk, använd den för att logga in.");
        } else {
            showError("<h2>Inloggningen misslyckades</h2>Tog emot ett oväntat svar från servern:<br><br>" + json.status);
        }
    })
    .catch(json => {
            if (json.status === "ambiguous") {
                showError("<h2>Inloggningen misslyckades</h2>Det finns flera medlemmar som matchar '" + tag + "'. Välj något som är mer unikt, t.ex email eller medlemsnummer.");
            }
            else if (json.status === "not found") {
                showError("<h2>Inloggningen misslyckades</h2>Ingen medlem med det namnet, email eller medlemsnummer existerar.");
            }
            else {
                showError("<h2>Inloggningen misslyckades</h2>Tog emot ett oväntat svar från servern:<br><br>" + json.status);
            }
        })
        .catch(() => {
            showError("<h2>Inloggningen misslyckades</h2>Kunde inte kommunicera med servern.");
        }
    );
}

export function render_login(root: HTMLElement, heading: string, redirect: string) {
    heading = heading || "Logga in";
	root.innerHTML = `
            <div>
                <h1 style="text-align: center;">${heading}</h1>
                <form class="uk-form">
                        <div class="uk-form-row" style="margin: 16px 0;">
                            <input autoFocus ref="tag" class="uk-form-large uk-width-1-1" type="text" placeholder="Email/Medlemsnummer"/>
                        </div>
                        
                        <div class="uk-form-row" style="margin: 16px 0;">
                            <button class="uk-width-1-1 uk-button uk-button-primary uk-button-large"><span class="uk-icon-check"/>
                            	Gå vidare
                            </button>
                        </div>
                </form>
            </div>`;
	const form = <HTMLElement>root.getElementsByTagName("form")[0];
	const tagInput = <HTMLInputElement>root.getElementsByTagName("input")[0];
	form.onsubmit = e => {
		e.preventDefault();
        const tag = tagInput.value;

        // Error handling
        if (!tag) {
            UIkit.modal.alert("Du måste fylla i din E-postadress");
            return;
        }

        login_via_single_use_link(tag, redirect);
	}
}
