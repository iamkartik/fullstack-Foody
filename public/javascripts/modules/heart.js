import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e){
    // prevent posting form
    e.preventDefault();
    // this is the form element .action contains the url
    axios
        .post(this.action)
        .then(res=>{
            // get the button from the form (name=heart) and toggle the hearted class
            const isHearted = this.heart.classList.toggle('heart__button--hearted');
            // update the count simultaneosly
            $('.heart-count').innerText = res.data.hearts.length;
            // add the hearted animation
            if(isHearted){
                this.heart.classList.add('heart__button--float');
                // remove the class after 2.5s as the animation lasts for 2.5s
                setTimeout(()=>this.heart.classList.remove('heart__button--float'),2500);
            }
        })
        .catch(err=>console.error(err));
    

}

export default ajaxHeart;