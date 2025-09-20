export class KeyEvents {
    constructor() {
        this.keys= {
            Control:false,
        }
        this.events = {
            
        };
        this.controlEvents = {

        };
        document.addEventListener("keydown",(e) => {this.KeyDown(e)});
        document.addEventListener("keyup",(e) => {this.KeyUp(e)});
    }
    KeyUp(event) {
        let key = event.key.toLowerCase();
        if(this.keys.Control) {
            if(this.controlEvents.hasOwnProperty(key)) {
                this.controlEvents[event.key][1]();
            }
        }
        else{
            if(this.events.hasOwnProperty(key)) {
                this.events[key][1]();
            }
        }
        this.keys[key] = false;
    }
    KeyDown(event) {
        let key = event.key.toLowerCase();
        if(this.keys.Control) {
            if(this.controlEvents.hasOwnProperty(key)) {
                this.controlEvents[key][0]();
            }
        }
        else{
        if(this.events.hasOwnProperty(key)) {
            this.events[key][0]();
        }
        this.keys[key] = true;
    }
}
    AddEvent(key="a",downLambda = ()=>{},upLambda = ()=>{}, controlEvent = false) {
        if(controlEvent) {
            this.controlEvents[key] = [downLambda,upLambda];
        }
        else{
            this.events[key] = [downLambda,upLambda];
        }
    }
}
