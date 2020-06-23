//examples  on how it work
/**********************************************
//GLOBAL MODULE
var budgetController = (function(){            
    
    var x = 20;
    
    var add = function (a){
      return  x + a; 
    }
    
    return{                 // to be accessed in the outside of the scope.(return an object containg f(x)s we want to be public)
        publicTest : function(b){
            return add(b);
        }
    }
})();

 // UI CONTROLLER
 
var UIController = (function(){              
    //some codes
})();

// GLOBAL APP CONTROLLER 

var controller = (function(budgetCtrl , UICtrl){                  
   // budgetController.publicTest(10);      (can be used but it can be difficult if you want to change( budgetController) name throuh codes)  
    
    var P = budgetCtrl.publicTest(10);
    
    return{                        
        anotherPublic : function(){
             console.log(P);
        }
    }
})(budgetController , UIController);

*/

//GLOBAL MODULE
var budgetController = (function(){            
    
    var Expenses = function(id,description,value){        //Expense is a function constructor
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expenses.prototype.calcPercentage = function(totalIncome){     // f(x) to calcul % which will be used to get % for each expense
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage = -1;
        }
    };
    
    Expenses.prototype.getPercentage = function(){      // this retrieve the calculated %
       return this.percentage; 
    };
    
    
    var Income = function(id,description,value){        // Income is a function constructor
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){         // this is to help calculateBudget by calculating tot inc and exp but privately
      
        var sum =0;
        data.allitems[type].forEach(function(current){  // forEach is for looping through the elements of the array
            
          sum += current.value; // sum = sum + current.value
            
        });
        data.totals[type] = sum;  //to put the sum found the the totals data
        
    };
    
    var data = {                 // data structure to keep all the data(inc, exp, their totals)
        allitems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    };
    return {
        
        addItem : function(type,des,val){        
            
            var newItem, ID;     // newItem where new exp and inc will be stored
            //[12345] next 6
            //[12468] next 9
            //ID = lastId + 1;
            
            //  creation of ID for the new item
            
            if(data.allitems[type].length > 0){  
                
                ID = data.allitems[type][data.allitems[type].length - 1].id + 1; 
            }
            else{
                ID = 0;
            }
            
            
            
            if(type === 'exp'){     //this is where other modules will add new items
                
                newItem = new Expenses(ID,des,val);
            } else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }
           data.allitems[type].push(newItem); //push it into data structure above
            
            return newItem;      //return the new element
        },
        
        deleteItem : function(type , id){
            
            var ids,index;
            //id = 6
           // ids = [0 1 2 4 6 8 10]
            // index to delete 4
            //data.allitems[type][id] this would remove 10 as it is the elt nbr 6 knd we want to remove id===6 so it can't be used except if the ids are in order.
            
            // to solve this we create an array with all the ids we have
            
            ids = data.allitems[type].map(function(current){  // it differ from forEach f(x) because it return a brand new array and it's callback f(x) has access to the crnt elt,crnt index and the whole array 
                  return current.id;             
                })
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allitems[type].splice(index , 1); //splice delete item not slice which provide a copy of an array
            }
        },
        
        calculateBudget : function(){
            
            // calculate the total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget : income - expenses
            
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate the percentage of income spent 
            
            if(data.totals.inc > 0) {
                 data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
           
        },
        
        calculatePercentages : function(){   // for each expense we have
            
         data.allitems.exp.forEach(function(cur){
             
             cur.calcPercentage(data.totals.inc);
         });
                                   
        },
        
        getPercentage : function(){    // to return the calculated % above
          var allpercentages = data.allitems.exp.map(function(cur){          // map return smth and store it in a variable
              return cur.getPercentage();
          });
              
           return allpercentages;  // this is an array of all the percentages
        },
        
        getBudget : function(){            //this method is for returning the budget
        
            return{         //object to return everything at the same time
                
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                budget : data.budget,
                percentage : data.percentage
                
            };
        
         },
        
        testing : function(){
            console.log(data);
        }
        
    };  
    
    
})();


// UI CONTROLLER       (it need to be public to be accessed in other controllers)
 var UIController = (function(){    
     
     var DOMstrings = {
         inputType : '.add__type',
         inputDescription : '.add__description',
         inputValue : '.add__value',
         inputBtn : '.add__btn',
         incomeContainer : '.income__list',
         expensesContainer : '.expenses__list',
         budgetLabel:'.budget__value',
         incomeLabel : '.budget__income--value',
         expensesLabel : '.budget__expenses--value',
         percentageLabel: '.budget__expenses--percentage',
         container:'.container',
         expensesPercentagesLabel :'.item__percentage',
         dateLabel : '.budget__title--month'
         
     }
     var formatNumber = function(numb,type){
             
             var numbSplit,int,dec;
             /*
             1. + or - before number
             2.the decimal numbers after a point
             3.a comma separating thousands
             */
             numb = Math.abs(numb);  // remove a + or - on a number
             numb = numb.toFixed(2); // toFixed is  method of a number prototype not math prototype(it puts 2 dec nbr)
             numbSplit = numb.split('.'); // divide the nbr sring in 2 part int and dec
             
             int = numbSplit[0];
             
            if(int.length > 3){
                
             //int = int.substr(0,1) + ',' + int.substr(1,3); // it will start on position 0 and read 1st element(2345->2,345)
                
             int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);  //for nbrs with more than 4 digits(23456 -> 23,456) 
            } 
              
             dec = numbSplit[1];
             
             
             
             return (type === 'exp'? '-' : '+')+' '+ int +'.'+ dec;
         };
     
      var nodeListForEach = function(list, callBackFx){
              for(var i = 0; i < list.length ; i++){
                 callBackFx(list[i],i); 
              }
          };  
         
    
     return {
        getInput : function(){
            
            return{           //created object in order to return the 3 at the same time(by returning the object itself)
                
    type: document.querySelector(DOMstrings.inputType).value,      
    description : document.querySelector(DOMstrings.inputDescription).value,
    value : parseFloat( document.querySelector(DOMstrings.inputValue).value) //parseFloat is for making value a nbr not a string
            };
        
         //   var type = document.querySelector('.add__type').value;        // it is either inc or exp
         //   var description = document.querySelector('.add__description').value;
         //   var value = document.querySelector('.add__value').value;
             },
         
         addListItem : function(obj , type){  // object is the step 2 (newItem) in the global app controller
             
             var html , newHtml,element;
             
           // create HTML string with placeholder text
             if(type === 'inc'){
                 
            element = DOMstrings.incomeContainer;
            html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                 
             } else if(type === 'exp'){
            element = DOMstrings.expensesContainer; 
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
             
             }
             
           // replace the placeholder with some actual data
            
        newHtml = html.replace('%id%',obj.id);
        newHtml = newHtml.replace('%description%', obj.description); // bcz if we replace again on html, id placeholder would still be there
        newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
             
           // insert the HTML into the DOM
             
             document.querySelector(element).insertAdjacentHTML('beforeend', newHtml); // used beforeend so that the new item comes as a child and lastly not as a sibling.
         },
         
         deleteListItem : function(selectorID){  //selectorID is for getting the whole itemID   
             //document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID))
          var el = document.getElementById(selectorID)     // dlt elt by deleting child of the parent,...
          el.parentNode.removeChild(el)
         },
         
         clearFields : function(){
          var fields, fieldArr;
          fields = document.querySelectorAll(DOMstrings.inputDescription +',' + DOMstrings.inputValue); //queSelAll returns a node list of all elements  
        
          fieldArr = Array.prototype.slice.call(fields); // to convert a list into an array.(slice :returns a shallow copy of an array so we trick it with a list )
          
          fieldArr.forEach(function(current,index,array){ //looping then for each element it sets it's value to empty 
              
              current.value = "";
          });
             
          fieldArr[0].focus(); //focus on the first element ariyo description
        
         },
         
         displayBudget : function(obj){ // object where all data are stored (object of getBudget function stored in budget var)
             
            // total inc, total exp,budget and percentage 
             var type;
             obj.budget > 0 ? type = 'Inc': type = 'Exp';
             
              document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
              document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'Inc');
              document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'Exp');
             
              if(obj.percentage > 0){
               document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';   
             }else{
                  document.querySelector(DOMstrings.percentageLabel).textContent = '---';
             }
             
         },
         
         displayPercentages : function(perc) {             // qSA bcz we hv many expenses not just one
          var fields = document.querySelectorAll(DOMstrings.expensesPercentagesLabel); //returns a node list  
             
        
          nodeListForEach(fields,function(current,index){       // this is the unnamed call back function with cur and index
         
         if(perc[index] > 0){
             
             current.textContent = perc[index] + '%';
         }else{
             
             current.textContent = '---';
         }
          });  
             
         },
         
         displayMonth : function(){
             var now,year,month,monthsarr;
             
             now = new Date();
             //var Birthday = new Date(2020,24,12);
             monthsarr = ['January','February','March','April','May','June','July','August','September','October','November','December']
             month = now.getMonth();
             year = now.getFullYear(); 
             document.querySelector(DOMstrings.dateLabel).textContent = monthsarr[month] + ' ' +year;
         },
         
         changedType : function(){
             var fields = document.querySelectorAll(
                 DOMstrings.inputType + ','+
                 DOMstrings.inputDescription + ',' +
                 DOMstrings.inputValue );
             
             nodeListForEach(fields , function(cur){
                 cur.classList.toggle('red-focus');
                             
                 });
             
           document.querySelector(DOMstrings.inputBtn).classList.toggle('red');  
             
         },
         
         
         getDOMstrings : function(){    // to make the DOMstrings public
             return DOMstrings;
         }
     };
})();


// GLOBAL APP CONTROLLER 
var controller = (function(budgetCtrl , UICtrl){ 
    
    var setUpEventListeners = function(){
        
    var DOM = UICtrl.getDOMstrings();
        
    document.querySelector(DOM.inputBtn).addEventListener('click' , ctrlAddItem);
    
    document.addEventListener('keypress' , function(event){  // event is for knowing what the target element is.
        
    if(event.keyCode === 13 || event.which === 13) {          // WHICH is for older browser or those without keycode property
            
         ctrlAddItem();   
        }
    });
        
     document.querySelector(DOM.container).addEventListener('click' , ctrlDeleteItem);  // we added the evtLsnr the container because it has both inc and exp. we did it by applying event delegation. then we put things in th attached f(x) ariyo ctrlDeleteItem  
    
    
     document.querySelector(DOM.inputType).addEventListener('change' , UICtrl.changedType); // to change the color to red when hit - to input exp
    };
    
    var budgetUpdate = function(){
        // 1. calculate budget
        
        budgetCtrl.calculateBudget();
        
        // 2. return budget
        
        var budget = budgetCtrl.getBudget();
        
        //3. display the budget on UI
         UICtrl.displayBudget(budget)
    };
    
    var updatePercentages = function(){
        // 1. calculate percentages
        
        budgetCtrl.calculatePercentages();
        
        // 2. read the percentage from the budget controller
        
        var perc = budgetCtrl.getPercentage();
        
        //3. update the UI with new percentages
        UICtrl.displayPercentages(perc);
    };
    
    var ctrlAddItem = function(){
        
        var input, newItem;
        
        // 1. get the field input data
         input = UICtrl.getInput();
            //console.log(input);
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
           
        // 2. add the item to the budjet controller
        
        newItem = budgetCtrl.addItem(input.type, input.description , input.value);
        
        // 3. add item to the UI
        
        UICtrl.addListItem(newItem, input.type);
        
        // 4. clear the field
        
        UICtrl.clearFields();
        // 5. calculate and update budget
        
        budgetUpdate();
            
        // 6. calculate and update the percentages
          updatePercentages();  
        }
        
        };
    
    var ctrlDeleteItem = function(event){      //event is for knowing what the target element is.
        var itemId, splitId,type,ID;
        
       itemId = (event.target.parentNode.parentNode.parentNode.parentNode.id);  //target where the click happened then 4 parentNode to move in the DOM until we reach the elt we want(id = to give only the id of that parent elt)
        
        if(itemId){
            
            splitId = itemId.split('-');      //this if for splitting inc-1 to inc 1
            type = splitId[0];
            ID = parseInt(splitId[1]);   // ID comes from a string itemID so we have to make it a number(integer)
        }
        // 1. delete the item form the data structure
        
        budgetCtrl.deleteItem(type,ID);
        
        // 2. delete the item from the UI
        UICtrl.deleteListItem(itemId);
        
        // 3. update and show the new budget
        budgetUpdate();
        
        // 4. calculate and update the percentages
          updatePercentages();  
    };
    
return{
    init : function(){
        
        console.log('application has started!')
       
        UICtrl.displayMonth();
        
        UICtrl.displayBudget({       // setting everything to zero on the start
            totalInc : 0,
                totalExp :0,
                budget : 0,
                percentage : -1
                
        });

        setUpEventListeners();   //to call the setupEventListener function in the IIFE and publicly
    }
};
    
})(budgetController , UIController);


controller.init();    //this is important in order to make the whole eventListeners work























































