window.attach = (
  function () {
    var me = {
      debug: false,
      data: {
        defaults: {},
        ga: {
          sendEventsOnDebugMode: false
        }
      },
      util: {
        gaEvent: function (category, action, label, nonInteraction, dimensions) {
          window.dataLayer = window.dataLayer || [];
          var eventData = { event: 'atm.event', eventCategory: category, eventAction: action, eventLabel: label, nonInteraction: nonInteraction || 0 };
          if (typeof dimensions === 'object') {
            var keys = Object.keys(dimensions);
            for (var i = 0; i < keys.length; i += 1) {
              if (Object.prototype.hasOwnProperty.call(dimensions, keys[i])) {
                eventData[keys[i]] = dimensions[keys[i]];
              }
            }
          }
          me.debug && me.util.log('GA Event Data: ', eventData);
          (!me.debug || me.data.ga.sendEventsOnDebugMode) && window.dataLayer.push(eventData);
        },

        appendCSS: function (css) {
          document.head.insertAdjacentHTML('beforeend', '<style type="text/css">\n' + css + '\n</style>');
        },
        labelize: function (str, asLower, except) {
          str = str || '';
          except = (except || '');
          if (asLower) { str = str.toLowerCase(); }
          var label = '';
          var ACCENTS = 'àáâãäåòóôõöøèéêëðçìíîïùúûüñšÿýžÀÁÂÃÄÅÒÓÔÕÖØÈÉÊËÐÇÌÍÎÏÙÚÛÜÑŠŸÝŽ';
          var NON_ACCENTS = 'aaaaaaooooooeeeeeciiiiuuuunsyyzAAAAAAOOOOOOEEEEECIIIIUUUUNSYYZ';
          var strChars = (str || '').split('');
          var labelChars = [];
          for (var i = 0; i < strChars.length; i++) {
            var index = ACCENTS.indexOf(strChars[i]);
            labelChars.push((index != -1) ? NON_ACCENTS.substr(index, 1) : strChars[i]);
          }
          label = labelChars.join('');
          if (except != '') { except = except.split('').map(function (c) { return '\\' + c; }).join(''); }
          label = label.replace(new RegExp('[^\\w\a' + except + ']+', 'g'), ' ');
          label = label.replace(/\s+/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '');
          return label;
        },
        seekFor: function (selector, config, callback, fallback) {
          window.seeker = window.seeker || { for: {}, defaults: { tries: 20, delay: 500 } };
          var customConfig = config || {};
          var instanceConfig = {
            tries: customConfig.tries || window.seeker.defaults.tries,
            delay: customConfig.delay || window.seeker.defaults.delay
          };
          var id = selector.replace(/[^a-zA-Z0-9]/g, ' ').trim().replace(/\s+/g, '_').toLowerCase();
          if (window.seeker.for[id] != null) {
            clearInterval(window.seeker.for[id].instance);
          }
          window.seeker.for[id] = {
            triesLeft: instanceConfig.tries,
            instance: null
          };
          window.seeker.for[id].instance = setInterval(function () {
            if (window.seeker.for[id].triesLeft > 0) {
              window.seeker.for[id].triesLeft -= 1;
              var foundEls = document.querySelectorAll(selector);
              if (foundEls && foundEls.length > 0) {
                clearInterval(window.seeker.for[id].instance);
                if (typeof callback === 'function') {
                  callback(foundEls);
                }
                me.debug && me.util.log('"' + selector + '" found after ' + (instanceConfig.tries - window.seeker.for[id].triesLeft) + ' attempts.');
              } else {
                // me.debug && me.util.log('Looking for "' + selector + '". ' + window.seeker.for[id].triesLeft + ' attempts remaining.');
              }
            } else {
              clearInterval(window.seeker.for[id].instance);
              if (typeof fallback === 'function') {
                me.debug && me.util.log('"' + selector + '" not found!');
                fallback();
              }
            }
          }, instanceConfig.delay);
        },
        log: function () {
          var printLog = (/\{\s*\[native code\]\s*\}/).test(console.log.toString()) ? console.log : ((/\{\s*\[native code\]\s*\}/).test(console.info.toString()) ? console.info : console.warn);
          var args = Array.prototype.slice.call(arguments);
          args.splice(0, 0, '%cATTACH Log:', 'background-color:#2F7DE1; color: #FFF; padding: 4px 8px; border-radius: 2px; font-size:12px; font-weight: 600;');
          printLog.apply(null, args);
        }
      },
    };
    return me;
  }
)();


if (typeof window.attach != 'undefined') {
  (function ABTestDrop() {
    var atm = window.attach;
    /* MAIN REFERENCES */
    var productItemsEls;
    var navItemsEls;
    var me = {
      debug: atm.debug || false,
      data: {
        currSectionId: '',
        filters: [],
      },
      fn: {
        showSection: function () {
          var sectionsEls = document.querySelectorAll('#RenderBodyDiv .go-exp4dot4-var1 .page-section');
          for (var i = 0; i < sectionsEls.length; i++) {
            var sectionEl = sectionsEls[i];
            var sectionId = sectionEl.getAttribute('id');
            if (sectionId !== me.data.currSectionId) {
              sectionEl.classList.remove('is-active');
              sectionEl.classList.add('non-active');
            } else {
              sectionEl.classList.remove('non-active');
              sectionEl.classList.add('is-active');
            }
          }
        },
        showFilterdProducts: function () {
          var filters = me.data.filters;
          if (filters.length === 0 || filters.indexOf('otros complemento') > -1) {
            for (var i = 0; i < productItemsEls.length; i++) {
              var filters = me.data.filters;
              var productItemEl = productItemsEls[i];
              productItemEl.classList.remove('non-active');
              productItemEl.classList.add('is-active');
            }
          } else {
            for (var i = 0; i < productItemsEls.length; i++) {
              var productItemEl = productItemsEls[i];
              var productDescriptionStr = '';
              var productDescriptionEl = productItemEl.querySelector('.product-item-img .img-des > span');
              if (productDescriptionEl) {
                productDescriptionStr = atm.util.labelize(productDescriptionEl.innerText, true);
              }
              var isVisible = false;
              for (var j = 0; j < filters.length; j++) {
                var filter = filters[j];
                if (productDescriptionStr.indexOf(filter) > -1) {
                  isVisible = true;
                  break;
                }
              }
              if (isVisible) {
                productItemEl.classList.remove('non-active');
                productItemEl.classList.add('is-active');
              } else {
                productItemEl.classList.remove('is-active');
                productItemEl.classList.add('non-active');
              }
            }
          }
        },
        createFilterHtml: function () {
          var headerSectionEl = document.querySelector('.wraperHeading');
          var options = [
            'Piezas de Pollo',
            'Nuggets',
            'Hot Wings',
            'Papas',
            'Pure',
            'Ensalada',
            'Bebidas',
            'Familiar',
            'Personal',
            'Otros Complementos',
          ];
          var optionsStr = '';
          for (var i = 0; i < options.length; i++) {
            var option = options[i];
            var optionLabelized = atm.util.labelize(option, true);
            var optionSingular = optionLabelized.replace(/(s)$/, '');
            var optionEl = `
            <li class="filter-option">
              <input type="checkbox" id="${optionLabelized}" name="${optionLabelized}" value="${optionSingular}">
              <label for="${optionLabelized}"><span>${options[i]}</span></label>
            </li>
          `;
            optionsStr += optionEl;
          }
          var filterStr = `
        <div id="filter" class="filter">
          <div class="filter-btn">
            <img src="https://i.imgur.com/2RpsPle.png" alt="">
            <span>Filtrar</span>
          </div>
          <ul class="filter-options">
            ${optionsStr}
          </ul>
        </di>
      `;

          headerSectionEl.insertAdjacentHTML('afterend', filterStr);
        },
        applyCss: function () {
          var cssAdded = `
          .go-exp4dot4-var1 #nav-bar-filter > li.active::after  {
            display: none!important;
          }
          .go-exp4dot4-var1 #nav-bar-filter > li:hover::after, .go-exp4dot4-var1 #nav-bar-filter > li.selected::after,.go-exp4dot4-var1 #nav-bar-filter > li.active.selected::after {
            content: '';
            width: 100%;
            right: 0;
            left: 0;
            background: #e4002b;
            height: 10px;
            bottom: -13px;
            bottom: -8px;
            display: block;
            position: absolute;
          }
          .go-exp4dot4-var1 #nav-bar-filter > li.active a span {
              border: none !important;
              box-shadow: none!important;
          }
          .go-exp4dot4-var1 #nav-bar-filter > li.selected a span {
            border: 2px solid #fff;
            box-shadow: 0 0 0 2px red;
        }

          .hide{
            display:none;
          }
            .non-active{
              display: none;
            }
            .is-active{
              display: block;
            }

            #filter {
              position: absolute;
              display: flex;
              align-items: flex-end;
              flex-direction: column;
              right: 1rem;
              background-color: inherit;
           }
           #filter .filter-btn {
              padding: 0.2rem 0.5rem;
              border: 1px solid #f8f8f8;
              height: 40px;
              width: max-content;
              display: flex;
              align-items: center;
              cursor: default;
           }
           
           #filter .filter-btn > img {
              max-height: 100%;
           }
           #filter > .filter-options {
              display: none;
           }
           
           #filter > .filter-options > li {
              list-style: none;
           }
           #filter > .filter-options.active {
            position: absolute;
            top: 45px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
            width: 220px;
            background-color: #f8f8f8;
            z-index: 999;
         }
           
           .filter-option {
              width: max-content;
              position: relative;
              width: 100%;
              display: flex;
              gap: 0.5rem;
           }
           .filter-option label {
              width: 20px;
              height: 20px;
              cursor: pointer;
              position: absolute;
              top: 0;
              left: 0;
              background: #fff;
              border: 1px solid #bfbfbf;
              border-radius: 4px; 
           }

           .filter-option label span {
            position: absolute;
            left: 140%;
            width: max-content;
        }
           .filter-option label:after {
              content: "";
              width: 10px;
              height: 6px;
              position: absolute;
              top: 4px;
              left: 4px;
              border: 3px solid #fcfff4;
              border-top: none;
              border-right: none;
              background: transparent;
              opacity: 0;
              -webkit-transform: rotate(-45deg);
              transform: rotate(-45deg);
           }
           .filter-option label:hover::after {
              opacity: 0.3;
           }
           .filter-option input[type="checkbox"] {
              visibility: hidden;
           }
           
           .filter-option input[type="checkbox"]:checked + label:after {
              opacity: 1;
           }
           
           .filter-option input[type="checkbox"]:checked + label {
              background-color: #70578b;
           }
          `;
          atm.util.appendCSS(cssAdded);
        },
      },
      listeners: {
        onClickItemNav: function (e) {
          var target = e.currentTarget;
          for (var i = 0; i < navItemsEls.length; i++) {
            var navItemEl = navItemsEls[i];
            navItemEl.classList.remove('active');
            navItemEl.classList.remove('selected');
          }
          target.classList.add('selected');
          me.data.currSectionId = target.querySelector('a[data-infoexp4]').getAttribute('data-infoexp4');
          me.fn.showSection();
        },
        onChangeFilterOption: function (e) {
          var inputEl = e.currentTarget.querySelector('input[type="checkbox"]');
          var value = inputEl.getAttribute('value');
          if (inputEl.checked == true) {
            me.data.filters.push(value);
            me.fn.showFilterdProducts();
            atm.util.gaEvent('ab test - filtro de productos', 'add-filter', 'value');
          } else if (inputEl.checked == false) {
            me.data.filters.splice(me.data.filters.indexOf(value), 1);
            me.fn.showFilterdProducts();
            atm.util.gaEvent('ab test - filtro de productos', 'remove-filter', 'value');
          }
        },
        onClickOutsideFilter: function (e) {
          if (!e.target.closest('#filter')) {
            var filterOptionsEl = document.querySelector('#filter .filter-options');
            var isActive = false;
            filterOptionsEl && (isActive = filterOptionsEl.className.indexOf('active') > -1);
            if (isActive) {
              filterOptionsEl.closest('#filter').querySelector('.filter-btn').click();
            }
          }
        },
        onClickFilter: function (e) {
          var filterBtnEl = e.currentTarget.closest('#filter');
          if (filterBtnEl) {
            var filterOptionsEl = filterBtnEl.querySelector('.filter-options');
            if (filterOptionsEl) {
              var isActive = filterOptionsEl.className.indexOf('active') > -1;
              if (isActive) {
                atm.util.gaEvent('ab test - filtro de productos', 'close-filter', 'value');
              } else {
                atm.util.gaEvent('ab test - filtro de productos', 'open-filter', 'value');
              }
              filterOptionsEl.classList.toggle('active');
            }
          }
        },
      },
      run: function () {
        if (window.location.pathname === '/menu/overview') {
          atm.util.seekFor('.go-exp4dot4-original', { tries: 50, delay: 200 }, function () {
            /* REFERENCES */
            navItemsEls = document.querySelectorAll('.wraperHeading #nav-bar-filter li');
            productItemsEls = document.querySelectorAll('div.page-section div.meal-type[subcat="subcategory"]');
            var filterOptionsEls;
            var filterIconEl;
            /*  INITIALS */
            me.fn.applyCss();
            navItemsEls[0].classList.remove('active');
            navItemsEls[0].classList.add('selected');
            me.fn.createFilterHtml();
            me.data.currSectionId = document.querySelector('.wraperHeading #nav-bar-filter li.selected > a').getAttribute('data-infoexp4');
            me.fn.showSection();
            filterOptionsEls = document.querySelectorAll('#filter .filter-options li');
            filterIconEl = document.querySelector('#filter .filter-btn');

            /** Listeners **/
            document.removeEventListener('click', me.listeners.onClickOutsideFilter);
            document.addEventListener('click', me.listeners.onClickOutsideFilter);
            /*** Filter ***/
            filterIconEl.removeEventListener('click', me.listeners.onClickFilter);
            filterIconEl.addEventListener('click', me.listeners.onClickFilter);
            /*** Filter Options***/
            for (var i = 0; i < filterOptionsEls.length; i++) {
              var filterEl = filterOptionsEls[i];
              filterEl.removeEventListener('change', me.listeners.onChangeFilterOption);
              filterEl.addEventListener('change', me.listeners.onChangeFilterOption);
            }
            /*** Items nav ***/
            for (var i = 0; i < navItemsEls.length; i++) {
              var navItemEl = navItemsEls[i];
              navItemEl.removeEventListener('click', me.listeners.onClickItemNav);
              navItemEl.addEventListener('click', me.listeners.onClickItemNav);
            }
          });
        }
      },
    };
    return me;
  })().run();
}
