// axios to fetch the data 
// https://github.com/mzabriskie/axios
import axios from 'axios';
// to sanitize html from xss attacks 
import dompurify from 'dompurify';

function searchResultsHTML(stores){
    return stores.map(store => {
        return `
        <a href="/stores/${store.slug}" class="search__result">
            <strong>${store.name}</strong>
        </a>
        `;
    })
    .join('');
}

function typeAhead(search){
    // if no search bar don't run
    if(!search) return;

    const searchInput = search.querySelector('input[name="search"]');
    const searchResult = search.querySelector('.search__results');
    
    searchInput.on('input',function(){
        // if there is no text to search , then hide the search results 
        if(!this.value){
            searchResult.style.display = 'none';
            return;//stop further execution
        }
        // display results div
        searchResult.style.display='block';
        
        // get the data from server ,using the search text as query
        axios
            .get(`/api/search?q=${this.value}`)
            .then(res=>{
                if(res.data.length){
                    searchResult.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
                    return;//stop further execution
                }
                // in case no data found tell user no data found
                searchResult.innerHTML =dompurify.sanitize(`<div class="search__result">No result found for ${this.value}</div>`);
            })
            .catch(err=> console.error(err)); 
    });

    // handle keyboard inputs 
    searchInput.on('keyup',(e)=>{
        // 38, 40 ,13 for up down and enter
        // only check for those else return
        if(![38,40,13].includes(e.keyCode)){
            return; 
        } 
        
        // add an active class
        const activeClass = 'search__result--active';
        // get the current and all search results 
        const current = search.querySelector(`.${activeClass}`);
        const results = search.querySelectorAll('.search__result');
        let next;

        // if user presses down keyCode 40 and there is currently active element 
        if(e.keyCode===40 && current){
            // then make next as the next sibling or in case current == last element , then make next = first
            next = current.nextElementSibling || results[0];
        }else if(e.keyCode===40){
            // if there is no current item ( first time )
            next=results[0];
        }// if user presses the up key and there is a current element
        else if(e.keyCode===38 && current){
            // then make next as the prev sibling or in case current == first element , then make next = last
            next = current.previousElementSibling || results[results.length-1];
        }else if(e.keyCode===38){
            // if there is no current item ( last time )
            next=results[results.length-1];;
        }else if(e.keyCode===13 && current){
            window.location = current.href; // if enter is pressed go to the page
            return;
        }
        
        // remove the current class from the current one
        if(current){
            current.classList.remove(activeClass);
        }

        // add the active class to next
        next.classList.add(activeClass);
    });
}
// single import so export default , see bling for multi export
export default typeAhead;