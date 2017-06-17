class Interactive {
    constructor(max_step, step, sliderbar, callbacks){
        this.max_step = max_step;
        this.step = step;
        this.callbacks = callbacks; // callbacks respond to update method
        this.timer = null;
        this.sliderbar = sliderbar;
        this.sliderbar.attr('max', this.max_step);
    }
    
    move(){
        this.sliderbar.property('value', this.step);
        for(let callback of this.callbacks){
            callback.update(this.callback_data);
        }
    }
    
    cleanup(){
        if(this.timer !== null){
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    next(){
        this.cleanup();
        this.move(Math.min(this.step + 1, this.max_step - 1));
    }
    
    back(){
        this.cleanup();
        this.move(Math.max(this.step - 1, 0));
    }
    
    jump_to(value){
        this.cleanup();
        this.move(value);
    }
    
    animate(){
        if(this.timer !== null){
            clearInterval(this.timer);
            this.timer = null;
        } else {
            this.timer = setInterval(() => {
                let new_step = Math.min(this.step + 1, this.max_step - 1);
                this.move(new_step);
                
            }, 200);
        }
    }
}