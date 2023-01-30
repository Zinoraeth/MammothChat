// stored externally to allow remote changes without changing outputFAQ functionality
// different level of abstraction to avoid altering the FAQ function
import { blacklistKeywords, punctuationArr } from "./settings.js"; 

// probably overcomplicating it
// const formatObjects = function (output, parametersObj, name = '') {
//     return function() {
//         return {name, paramerters: parametersObj, output}
//     }
// }

// ---------------------- * Helper functions * ---------------------- //
// helper function abstraction of replacePunctuationByArray
// same functionality as replacePunctuationByArray but without strict settings
// this is to allow other executions with same method if so desired
const replaceByArray = (strToReplace = '', arrToReplace = [''], replacementStr = '') => 
    { arrToReplace.forEach(str => strToReplace.replaceAll(`${str}`, `${replacementStr}`)) }

// replace characters function
// const replacePunctuationByArray = function (text = '', settings = { punctuationArray : [ ...punctuationArr ], replacementChar : ' '}) {
const replacePunctuationByArray = function (text = '', settings = new Defaults()) {
    let output = text.slice(0); // dont mutate parameters // replaceAll doesn't mutate it returns new str

    // destructoring for required settings
    const {punctuationArray, replacementChar} = settings;

    // console.warn(`DEBUG> REQUIRE`, '{punctuationArray, replacementChar}');
    // console.warn(`DEBUG> input>`, `${text}, settings`);

    replaceByArray(output, punctuationArray, replacementChar);

    // punctuationArray.forEach (char => { output = output.replaceAll(`${char}`, `${replacementChar}`); }); 
    // console.warn(`output`, output);
    // console.log(``);

    return output;
}

// this function removes invalid keywords from an array of keywords
// return a copy of an array that has the correct keywords removed
// only define defaults as the correct data type of a null equivalent, let the main function handle data defaults
const removeFalsePositives = function(strArr = [''], keywordsToRemove = ['']) { 
    // console.warn(`DEBUG> REQUIRE> no-settings`, 'strArr, keywordsToRemove');
    // console.warn(`DEBUG> input>`, `${strArr}, ${keywordsToRemove}`);

    // make a copy of the original then filter array
        // by not returning the entries that are found within the remove array
    const filteredArr = [ ...strArr ]
            .filter (word => !keywordsToRemove.find (remove => word.toLowerCase() == remove.toLowerCase(), false)); 

    // console.warn(`output`, filteredArr);
    // console.log(``);

    return filteredArr; // return new array rather than mutating parameter
}

// ---------------------- * Comparison functions * ---------------------- //

// note might need to refactor subfunctions of filter due to duplicated code
// same input and several steps identical

// dont mutate parameters
// Partial string comparison by comparing a certain amount of character instead of the whole word
// compares from the start of the word up to the consecutive length for both sets of keywords
const nonStrictComparison = function (
        FAQ = [], // FROZEN FAQ is an array of words - this isn't the original FAQ array but a manipulation
        MSG = [], // array of words 
        // settings = { bool: true, consecutive: 3 } // be very careful with this variable // todo fix all object 
        // note bool was absolete in this context
        settings = new Controller([''])
) {
    // destructoring required settings
    const { consecutiveCount } = settings;

    // console.warn(`DEBUG> REQUIRE`, '{consecutiveCount}');
    // console.warn(`faq`, FAQ);
    // console.warn(`msg`, MSG);
    // console.log(``);

    // .map((val, i, arr) => {if (!i) {console.log(`array:`, arr);}; return val}) // use this to see data  
    const   faq = [...FAQ] // array of char ['Q',  ' ', 'w', 'h', 'y', ' ', 'd', 'o', ' ', 'i']
                        .join('').split(' ') // ['Q', 'why','do','i','need',o','install','a', etc]
                        // remove everything smaller than consecutive length
                        .filter( (word) => !(word.length < consecutiveCount) ), // ['why','need', 'install','virtual','machine, etc]
            msg = [...MSG] // [ 'install', 'vm', 'onto', 'computer' ]
                        .filter( (word) => !(word.length < consecutiveCount) ); // [ 'install', 'onto', 'computer' ]
    
    const match = [];

    msg.forEach( (msgKeyword, i) => {
        // slice gives you exactly the same length as consecutive
        const message = msgKeyword.slice(0, consecutiveCount).toLowerCase(); // ['ins','ont','com']

        faq.forEach( (faqKeyword) => {
            // converting keyword to lowercase for direct string comparison
            const answer = faqKeyword.slice(0, consecutiveCount).toLowerCase(); // ['why','nee', 'ins', etc]

            if (message != answer) return match;
            // else
            match.push(msg[i]);
        } );
    } );

    // console.warn(`output`, match);
    // console.log(``);

    return match; 
}

// refactor // todo split existing comparison filters each into their own sub function
// note we currently have strict, strictPartial & partial

// refactor version of partial matching by daniel
// refactor work it back into the main logic the start should be the same as current logic 
// refactor with only the lower part being different
// rename into parial existing two methods are strict and strictPartial respectively
//a different version of partial match. Looks to find matches to any substring of length specified in settings obj
const partialComparison = function (
    FAQ = [], // FROZEN FAQ is an array of words 
    MSG = [], // array of words 
    // settings = { bool: true, consecutive: 3 } // be very careful with this variable // todo fix all object parameters
    settings = new Controller([''])
) {
    // destructoring required settings
    const { consecutiveCount } = settings;

    // console.warn(`DEBUG> REQUIRE`, '{consecutiveCount}');
    // console.warn(`faq`, FAQ);
    // console.warn(`msg`, MSG);

    // debug verify if this is working as expected as well as other comparison functions


    //note we should probably do a strict check for words smaller than settings.consecutive, to catch things like 'VM'
    // .map((val, i, arr) => {if (!i) {console.log(`array:`, arr);}; return val}) // use this to see data  
    const   faq = [...FAQ] // array of char ['Q',  ' ', 'w', 'h', 'y', ' ', 'd', 'o', ' ', 'i']
                        .join('').split(' ') // ['Q', 'why','do','i','need',o','install','a', etc]
                        // remove everything smaller than consecutive length
                        .filter( (word) => !(word.length < consecutiveCount) ), // ['why','need', 'install','virtual','machine, etc]
            msg = [...MSG] // [ 'install', 'vm', 'onto', 'computer' ]
                        .filter( (word) => !(word.length < consecutiveCount) ); // [ 'install', 'onto', 'computer' ]
    const match = [];
    //just making copies, variable naming is terrible i know
    const faq2 = [];
    const msg2 = [];
    //taking every substring of length == consecutive and pushing to faq2
    faq.forEach((word) => {
        for(let i = 0; i + consecutiveCount <= word.length; i++){
            let tempWord = word.slice(i, i + consecutiveCount);
            faq2.push(tempWord);
        }
    })
    //taking every substring of length == consecutiveCount and pushing to msg2
    msg.forEach((word) => {
        for(let i = 0; i + consecutiveCount <= word.length; i++){
            let tempWord = word.slice(i, i + consecutiveCount);
            msg2.push(tempWord);
        }
    })
    //comparing every keyword between msg2 and faq2, and pushing any matches to the array 'match'
    msg2.forEach( (faqKeyword, i) => {
        faq2.forEach( (msgKeyword, j) => {
            if(faqKeyword != msgKeyword) {
                return match;
            }
            else{
                match.push(msg2[i]);
            }
        })
    });

    // console.warn(`output`, match);
    // console.log(``);

    return match;
}

// ---------------------- * Main Filter Logic * ---------------------- //

// const filterFAQ = function (userInputArr, FAQarr, strict = { bool: false, consecutive: 3 }, trace = { bool: true }) { 
// const filterFAQbackup = function (userInputArr, settings = new Controller([''])) { // Defaults doesnt have an FAQ property
//     // remove the default but also enforce the correct type
//     const FAQ = (  Array.isArray(settings.FAQ) ) ? [ ...FAQarr ] : [ '' ]; // copy
//     const txt = (  Array.isArray(userInputArr) ) ? [ ...userInputArr ] : [ '' ]; // copy

//     // const FAQ = (  Array.isArray(FAQarr) ) ? [ ...FAQarr ] : [ '' ]; // copy
//     // const txt = (  Array.isArray(userInputArr) ) ? [ ...userInputArr ] : [ '' ]; // copy

//     // destructoring dependancies
//     const { filterParial, filterSemiStrict, filterStrict, consecutiveCount } = settings;

//     // store array of index rather than filter array to preserve original copy
//     // and allow a new array to be filtered by the index rather than the content
//     const matchedKeywords = new Set(), // todo using single set for compilation 
//           matchedIndex    = new Set();

//     const outputIndexArray = [], matchedKeywordsArray = []; 
//     const outputIndexArrayP = [], matchedKeywordsArrayP = []; // delete just for testing
//     let faqWithSpaces;
//     let faqWithSpacesP = [];

//     FAQ // ['Q: this. A: that.'] 
//         .map(sentenceStr => sentenceStr.replaceAll('\n', ' ')) // remove \n tags before we split else headache
//         .map (sentenceStr => {
//             faqWithSpaces =  replacePunctuationByArray( sentenceStr, { punctuationArr, replacementChar: '' } ) ;

//             faqWithSpacesP.push( replacePunctuationByArray(sentenceStr, { punctuationArr, replacementChar: '' }) );

//             return faqWithSpaces // ['Q  this   A  that '] // remove punctuation
//             .split (' ') // ['Q', '', '', 'this', '', '', '', 'A', '', '', 'that', ''] // split into array  
//             .filter (el => el != '' && el != ' ') // ['Q', 'this', 'A', 'that'] // remove spaces 
//             // .map((val, i, arr) => {if (!i) {console.log(`array:`, arr);}; return val}) // tool
//         })
//         // this map is more like a forEach
//         .map ((faq, i, ar) => { // faq is an array of words
//             /* i= 5 
//                 faq = [ 'Q', 'why', 'do', 'i', 'need', 'to', 'install',  'a', 'virtual',  'machine\nA', 
//                         'because', 'cross', 'platform', 'support', 'is', 'a', 'bit', 'janky', 'without',  'a', 'vm' ]  */
//             Object.freeze(faq); // frozen

//             // refactor use sets // priority **
//             // note calculate strict keywords add them to set
//             // note then add partial keywords and test all before returning functionality
//             // note if partial not enabled then dont add them to keywords

//             // note dont overwrite i 
//             // non strict comparison
//             if (true) { // debug delete once working
//             // if (!strict.bool) { // debug uncomment once working

//             // note words like chemistry and biochemistry wont match with current partial Matching
//             // todo revise or expand working functionality to include partial matches within words
//                 // const temp = [...nonStrictComparison(faqWithSpaces, txt, strict)];
//                 const temp = [...nonStrictComparison(faqWithSpacesP[i], txt, strict)];

//                 if (temp.length > 0) {  // match found
//                     outputIndexArrayP.push(i); // debug remove P once working and delete declaration
//                     matchedKeywordsArrayP.push( ...temp ); // debug remove P once working and delete declaration
//                 }
                
//                 // return faq; // remember to return with map // debug uncomment once working
//             }; // else strict comparison // idea do both rather than just one depending on bool
//             txt.forEach( (userKeyword, k, arr) => { // [ 'install', 'vm', 'onto', 'computer' ]
//                 Object.freeze(userKeyword); // frozen
//                 // let index;
//                 const findKeyword = faq.find( (faqKeyword, j, arr) => {
//                     // index = j; // fixed there is your problem
//                     return faqKeyword.toLowerCase() == userKeyword.toLowerCase();
//                 } ); // returns true or undefined

//                 // if keyword not found exit else store result
//                 if (!findKeyword) return; // if undefined return // foreach return not .map

//                 // console.log(`storing result as index: keyword`,'-', index,':',key);
//                 // console.log(`find i: arr`,k,':', t); // this is array of words within faq
//                 // console.log(`foreach i:`,i); 

//                 outputIndexArray.push(i);
//                 matchedKeywordsArray.push(userKeyword);
//             });

//             return faq; // remember to return with map // refactor this is a forEach, dont need to map
//         }); // end FAQ.map();
    
//         console.log(`>>>>>>>>>>>>> results >>>>>>>>>>>>>`);
//         // console.log(`expected results may now be missing matches due to updated junk data`);
//         console.log(`--- strict ---`); 
//         // console.log(`index:`, outputIndexArray, '||', 'expected result', [5]); // fixme use set to eliminate duplicates
//         // console.log(`keywords:`, matchedKeywordsArray, '||', 'expected result', ['install', 'vm']);

//         console.log(`index:`, [...new Set(outputIndexArray)]); // fixme use set to eliminate duplicates
//         console.log(`keywords:`, [...new Set(matchedKeywordsArray)]);
//         console.log(``);

//         console.log(`--- Partial ---`);
//         // console.log(`index:`, outputIndexArrayP, '||', 'expected result', [4, 5]); 
//         // console.log(`keywords:`, matchedKeywordsArrayP, '||', 'expected result', ['install']); // fixme use set to eliminate duplicates

//         console.log(`index:`, [...new Set(outputIndexArrayP)]); // note thanks daniel
//         console.log(`keywords:`, [...new Set(matchedKeywordsArrayP)]); // fixme use set to eliminate duplicates
//         console.log(``);
        
//     // tracing exists in order to add more works to the filter
//     // this is a manual process but with some time most keywords will be relevant
//     if (trace.bool) {
//         //currently only outputing strict
//         console.log(`Matching Type :` , `${(strict.bool)? 'STRICT' : 'PARTIAL'}`); // todo strict and partial
//         // next two only works for strict // todo
//         // console.log(`Keywords      :`, ( matchedKeywordsArray.length > 0) ? [ ...new Set(matchedKeywordsArray)] : 'none'); // todo strict and partial
//         // console.log(`indexes       :`, outputIndexArray);
//     }

//     console.log(`   ----------------`);

//     // array of indexes that had a keyword match
//     // set eliminates any possible duplicates
//     // set needs to be spread because it's an object not an array
//     // return [ ...new Set(outputIndexArray) ]; 
//     // return [ ...new Set((strict.bool)? outputIndexArray : matchedKeywordsArrayP) ]; // returning keywords like a dumbass
//     return [ ...new Set((strict.bool)? outputIndexArray : outputIndexArrayP) ]; // delete outputIndexArrayP partial works
// }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// filter FAQ array for keywords that match the user input then returns the filtered FAQ array // I don't think this mutates either
// dont pull defaults from top scope let the function supply them
const filterFAQ = function (userInputArr, settings = new Controller([''])) { // Defaults doesnt have an FAQ property
    // destructoring dependancies
    const { filterParial, filterSemiStrict, filterStrict, consecutiveCount } = settings;

    // remove the default but also enforce the correct type
    const FAQ = (  Array.isArray(settings.FAQ) ) ? [ ...FAQarr ] : [ '' ]; // copy
    const txt = (  Array.isArray(userInputArr) ) ? [ ...userInputArr ] : [ '' ]; // copy

    // store array of index rather than filter array to preserve original copy
    // and allow a new array to be filtered by the index rather than the content
    const matchedKeywords = new Set(), // todo using single set for compilation 
          matchedIndex    = new Set();

    const faqWithSpaces = [];

    FAQ // ['Q: this. A: that.'] 
        .map(sentenceStr => sentenceStr.replaceAll('\n', ' ')) // remove \n tags before we split else headache
        .map (sentenceStr => {
            faqWithSpaces.push( replacePunctuationByArray(sentenceStr, settings) ); // todo settings // fixme

            // console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>`);
            // console.log(`faqWithSpaces-----`, faqWithSpaces);

            return faqWithSpaces // ['Q  this   A  that '] // remove punctuation
                // note due to changes in code faqWithSpaces is already in the correct format for filtering
                // .split (' ') // ['Q', '', '', 'this', '', '', '', 'A', '', '', 'that', ''] // split into array  
                .filter (el => el != '' && el != ' ') // ['Q', 'this', 'A', 'that'] // remove spaces 
            // .map((val, i, arr) => {if (!i) {console.log(`array:`, arr);}; return val}) // tool
        })
        // this map is more like a forEach
        .forEach ((faq, i) => { // faq is an array of words
            // note dont overwrite i 
            /* i= 5  ***(example from old testing data)***
                faq = [ 'Q', 'why', 'do', 'i', 'need', 'to', 'install',  'a', 'virtual',  'machine\nA', 
                        'because', 'cross', 'platform', 'support', 'is', 'a', 'bit', 'janky', 'without',  'a', 'vm' ]  */
            Object.freeze(faq); // frozen

            // each filter down will most likely have more matches
            // thus more results but also less related results

            // strict comparison
            if (filterStrict){ 
                txt.forEach( userKeyword => { // [ 'install', 'vm', 'onto', 'computer' ]
                    const findKeyword = faq.find( faqKeyword => faqKeyword.toLowerCase() == userKeyword.toLowerCase() ); 
                    // returns true or undefined

                    // if keyword not found exit else store result
                    if (!findKeyword) return; // if undefined return // foreach return not .map

                    matchedIndex.add(i);
                    matchedKeywords.add(userKeyword);
                });
            }

            // partially strict comparison
            if (filterSemiStrict) { 
                const temp = [...nonStrictComparison([faqWithSpaces[i]], txt, settings)]; 

                if (temp.length >! 0) return;  // return if match not found
                // else match found and continue

                matchedIndex.add(i);
                temp.forEach( key => matchedKeywords.add(key) );
            }; 

            // daniel's partial comparison
            // same logic as semi strict
            if (filterParial) { 
                const temp = partialComparison(faq, txt, settings); 

                if (temp.length >! 0) return; 

                matchedIndex.add(i);
                temp.forEach( key => matchedKeywords.add(key) )
            }

            // todo filterNonConsecutivePartialStrict
            // strict matching of keywords the same length as keyword
            // example vm and vm-windows
            // matching smaller than consecutive

        }); // end FAQ.forEach();
    
        // cleaner debugging output // todo create debug boolean setting
        // if (true) {
        //     console.log(`>>>>>>>>>>>>> results >>>>>>>>>>>>>`);
        //     console.log(`- Filter Types -`);
        //     console.log(`filterStrict: `, filterStrict);
        //     console.log(`filterSemiStrict: `, filterSemiStrict);
        //     console.log(`filterParial: `, filterParial);
        //     console.log(``);
            console.log(`- Filter Results -`);
            console.log(`matchedKeywords: `, [...matchedKeywords]);
            console.log(`matchedIndex: `, [...matchedIndex]);
        //     console.log(`Data-type: `, Set);
        //     console.log(``);
        // }
        
    console.log(`   ----------------`);

    // array/ set of indexes that had a keyword match
    // set eliminates duplicatation but needs to be spread and returned within array
    return [...matchedIndex];
}

// ---------------------- * Main execution/ controller/ exported function * ---------------------- //

// defaults stored as a global viarable 
// to avoid some DRY duplication and to optimize declaration
// meaning we only have to change defaults once
// reason why defaults are assigned twice matters
    // first to aid whoever calls the exported function (refer as caller)
        // it shows them what variables they have access to
        // and the expected data types for those variables
    // the second reason they are assigned twice is due to the nature of objects
    // unfortunatly if the caller changes one variables the other dependant variables would be lost
    // in order to ensure that the caller can change a few specific variables without
        // losing the other declared paramerters
    // we thus need to define them outside of the function paramerters
    // however if we move the defaults out of the paramerters
    // the caller wont have access to/ be able to see which variables they have access to
// hence the DRY duplication of defaults
// the global viarable for defaults exist to simplify the DRY code
// these settings are meant to allow the admin/ mod to adjust the functionality of the FAQ as needed
// const defaultValues = {
//     wordsToIgnore: blacklistKeywords, 
//     punctuationToReplace: punctuationArr, 
//     punctuationReplaceChar: '', 
//     filterStrict: true, 
//     filterSemiStrict: true, 
//     filterParial: true,
//     consecutiveCount: 3 
// }

// consider moving main function to the top of the scope - functions are hoisted
// this function will construct the FAQ output message for the chat
// instead of the normal way of declaring parameters the function accepts an object of settings
    // this allows the programer to choose which paramters they wish to declare
    // and in what order, this also makes it easier to add additional parameters later
    // without having to make major changes elsewhere in the code
    // and if you do it wont affect the rest of the app (if done within reason)
// using defaults to specify expected data types
const outputFAQ = function (
    userTxt = ``, // clean user message string (can be multi-lined)
    FAQquestions = [``], // array of FAQ current format array of string ['Q: this. /n A: that.'] 
    settings = new Controller(['']) // Defaults doesnt have the FAQ array 
    // unforseen error: when trying to alter one or more keywords in settings you overwrite the entire object, deleting the other defaults
        // this error is being accounted for by declaring the defaults twice
    // setting abstraction
    // settings = { 
    //     // *main functionality
    //     wordsToIgnore: [...defaultValues.wordsToIgnore], // common words that result in a false positive when comparing
    //     punctuationToReplace: [...defaultValues.punctuationToReplace], // array of punctuation to replace with '' when comparing string
    //     punctuationReplaceChar: defaultValues.punctuationReplaceChar, // character to replace punctuation

    //     // *filter functionality
    //     // filter controls how expansive the FAQ results may be
    //         // depending on how many cases are true more results would be displayed 
    //         // depending on the respective strictness setting
    //         // note that although these are their own subsection
    //             // I did not split them into their own subsection 
    //             // that would overcomplicate calling this function even futher
    //     filterStrict: defaultValues.filterStrict, // strict word comparison
    //     // following filters depended on consecutiveCount
    //         filterSemiStrict: defaultValues.filterSemiStrict, // partial word comparison - first consecutive characters
    //         filterParial: defaultValues.filterParial, // partial character comparison - anywhere consecutive characters

    //     consecutiveCount: defaultValues.consecutiveCount // how many consecutive characters need to match in a parial comparison
    // }
    ) {

    // a litte destructoring // avoids having to use settings. for every variable
        // like how we are using defaultValues.
    // using destructoring as a practical way of redefining undefined settings
    // all of these variables need to exist in the scope of this function
    const { // todo cut description from paramerter list
        wordsToIgnore,
        punctuationToReplace,
        punctuationReplaceChar,
        filterStrict,
        filterSemiStrict,
        filterParial,
        consecutiveCount       
    } = settings; 
    // these settings would be split into new objects wherever they are relevant
    // within the sub functions of this module the defaults would not be redined again
        // the sub functions will rely on this function to handle defaults
        // however the sub functions will have null equivalent default values
            // mainly to indicate expected data types
    // most of the sub functions of this module will have their own settings object
        // this is to manage the repective function and allow for more modular execution

    // const pad = 25; // delete
    // console.log(`--- settings debugger ---`);
    // console.log(`wordsToIgnore?`.padEnd(pad, ' '),':', wordsToIgnore.length > 0);
    // console.log(`punctuationToReplace?`.padEnd(pad, ' '),':', punctuationToReplace.length > 0);
    // console.log(`punctuationReplaceChar`.padEnd(pad, ' '),':', `'${punctuationReplaceChar}'`);
    // console.log(`filterStrict?`.padEnd(pad, ' '),':', filterStrict);
    // console.log(`filterSemiStrict?`.padEnd(pad, ' '),':', filterSemiStrict);
    // console.log(`filterParial?`.padEnd(pad, ' '),':', filterParial);
    // console.log(`consecutiveCount`.padEnd(pad, ' '),':', consecutiveCount);
    // console.log(`--- * ---`);
    // console.log(``);

      let text = userTxt.slice(0); // make a copy
    const FAQ = [...FAQquestions]; // copy

    // console.log(`Checkpoint ln:485`); 

    // if there is something to replace then replace it
    // accepts str returns str
    if ( punctuationToReplace.length > 0 ) text = replacePunctuationByArray(text, { punctuationArray: punctuationToReplace, 
                                                                        replacementChar: punctuationReplaceChar }); // fixme

    // console.log(`Checkpoint ln:492`); 

    text = text.split(' '); // makes string an array

    // accepts array returns array
    if (wordsToIgnore.length > 0) text = removeFalsePositives(text, wordsToIgnore); 
    
    // console.log(`Checkpoint ln:499`);
    
    // get index for filtering the FAQ // array of indexes
    // const indexArray = filterFAQ(text, FAQ, {bool: filterStrict, consecutive: consecutiveCount}, {bool: true}); 
    // console.log(`--- text ---`, text);
    // console.log(`--- settings ---`, settings);
    const indexArray = filterFAQ(text, settings); 

    // console.log(`Checkpoint ln:505`); 

    const filteredFAQ = []; // output

    indexArray.forEach(index => {
        filteredFAQ.push(FAQ[index]);
    });

    // console.log(`Checkpoint ln:513`); 

    // debug // delete
    // console.log(`FAQ:`); 
    // FAQquestions.forEach ( (str, i) => console.log(`#`,i,' - ', str.replace('A:', '        A:')) ); // like a genius forgot this is all 
    // filteredFAQ.forEach ( (str, i) => console.log(str.replace('A:', '        A:')) );
    // console.log(``);
    // console.log(`   Total Matches:`, [ ...new Set(filteredFAQ)].length);
    // console.log(``);

    // set is similar to an array except it cant hold duplicates and is an object not array
    // by spreading the set object '...' it can be converted into an array format
    return ( filteredFAQ.length > 0 ) ? [ ...new Set(filteredFAQ)].join('\n') : 'I failed to compile any FAQ related to your problem.'; // string
}

class Settings { // base 
    constructor() {
        
    }

    execute (value = null) {
        return value;
    }

    test (testArr = []) {
        testArr.forEach(el => this.execute(el));
        return testArr;
    }
}

// default abstracts the settings for FAQ controller while still providing access to its functionality
class Defaults extends Settings {
    // modern ES6 convention using _ for private variables
    // assigning defaults outside of constructor to allow only specific settings to be changed
    // instead of forcing dev to assign all
    _wordsToIgnore = blacklistKeywords;
    _punctuationToReplace = punctuationArr;
    _punctuationReplaceChar = '';
    _filterStrict = true;
    _filterSemiStrict = true;
    _filterParial = true;
    _consecutiveCount = 3;
    
    // defaults act as the parameters for settings hence why we extend
    constructor() { 
        super() 
        this._settings = {
           wordsToIgnore          : this._wordsToIgnore, 
           punctuationToReplace   : this._punctuationToReplace, 
           punctuationReplaceChar : this._punctuationReplaceChar, 
           filterStrict           : this._filterStrict, 
           filterSemiStrict       : this._filterSemiStrict, 
           filterParial           : this._filterParial, 
           consecutiveCount       : this._consecutiveCount
        };
    }

    // main getter function
    get settings () {
        return this._settings;
    }

    // set addSetting (item) { // cant do this unless variables stored in a map
    //     this.settings.push(item);
    // }

    // set functions to overwrite single settings
    // unfortunatly since this isnt typescript we can't assign default datatypes
    // consider abstracting this class to a typescript file
    set wordsToIgnore (arr = [...blacklistKeywords]) {
        return this._wordsToIgnore = arr;
    }

    set punctuationToReplace (arr = [...punctuationArr]) {
        return this._punctuationToReplace = arr;
    }

    set punctuationReplaceChar (str = '') {
        return this._punctuationReplaceChar = str;
    }

    set filterStrict (bool = true) {
        return this._filterStrict = bool;
    }

    set filterSemiStrict (bool = true) {
        return this._filterSemiStrict = bool;
    }

    set filterParial (bool = true) {
        return this._filterParial = bool;
    }

    set consecutiveCount (int = 3) {
        return this._consecutiveCount = int;
    }

    // get functions
    get wordsToIgnore () {
        return this._wordsToIgnore;
    }

    get punctuationToReplace () {
        return this._punctuationToReplace;
    }

    get punctuationReplaceChar () {
        return this._punctuationReplaceChar;
    }

    get filterStrict () {
        return this._filterStrict;
    }

    get filterSemiStrict () {
        return this._filterSemiStrict;
    }

    get filterParial () {
        return this._filterParial;
    }

    get consecutiveCount () {
        return this._consecutiveCount;
    }
}

// this is the controller for FAQ settings
    // to use this controller you just have to run execute
    // constructor will ensure that you have the FAQ
        // it also ensures that you don't have to define FAQ everytime you call executable
    // the execute runs on the user message
    // you can change any of the settings through their base set methods
    // by not changing the variables their assumed defaults will be used
class Controller extends Defaults { // base for controller
    _FAQ;
    constructor (faqArr) {
        super();
        this._FAQ = faqArr;
        if ( !Array.isArray(this.FAQ) ) 
            throw new Error(`Failed to initialize FAQ, -${FAQ}-. In order for the controller to function it requires an array of FAQ. Questions and their respective Answer should be a single combined entry within the array. ex ['Q... A...', 'Q... A...'] `);
    }

    set FAQ (arr = ['']) { return this._FAQ = arr }
    get FAQ () { return this._FAQ }

    test (msgArr = ['']) {
        msgArr.forEach ((msg, i) => {
            console.log(`- testing case #`, i +1, '-');
            console.log(`Input:`);
            console.log(msg);
            // console.log(`---`);
            try { // just to catch unforseen errors
                // console.log(`FAQ Trace:`);
                const result = this.execute(msg);
                console.log(`Result:`);
                console.log(result);
            } catch (error) {
                console.warn(`------ FAQ failed ------`);
                console.error(error);
                console.log(`------ * ------`);
            } 
            console.log(`-- end case #`, i +1, '--');
            console.log(``);
        });

        return msgArr;
    }

    execute (msg = '') {
        return outputFAQ(msg, this.FAQ, this.settings); // WIP 
    }
}

// ---------------------- * Module End * ---------------------- //

// the Controller it the control unit for this module
// due to the strict handling of the data flow, the controller makes it easier to use this module
// it is also the best way to expand the functionality with minimal effort
// where to add more features or to give 'safer' control to the caller
export { Controller }; 

// refactor change some arrays to sets to eliminate duplication 