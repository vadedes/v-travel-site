import '../styles/styles.css';
import 'lazysizes';
import MobileMenu from './modules/MobileMenu';
import RevealOnScroll from './modules/RevealOnScroll';
import StickyHeader from './modules/StickyHeader';
import ClientArea from './modules/ClientArea';

//React Related Code Goes Here
import React from 'react';
import ReactDOM from 'react-dom';

//Import react components
import MyAmazingComponent from './modules/MyAmazingComponent';

ReactDOM.render(<MyAmazingComponent />, document.querySelector('#my-react-example'));

//Main JS Code
new ClientArea();
new StickyHeader();
new RevealOnScroll(document.querySelectorAll('.feature-item'), 75);
new RevealOnScroll(document.querySelectorAll('.testimonial'), 60);

new MobileMenu();

let modal; //declare variable to be used below

//Setup to load the modal JS when needed - to save resources and improve overall performance
document.querySelectorAll('.open-modal').forEach((el) => {
    el.addEventListener('click', (e) => {
        e.preventDefault();

        if (typeof modal == 'undefined') {
            // the x represents the file imported and due to way webpack imports the files, we need to add a method called .default()
            import(/*webpackChunkName: "modal"*/ './modules/Modal')
                .then((x) => {
                    modal = new x.default(); //save to a variable
                    setTimeout(() => modal.openTheModal(), 20);
                })
                .catch(() => console.log('There was a problem.'));
        } else {
            modal.openTheModal();
        }
    });
});

if (module.hot) {
    module.hot.accept();
}
