export class DataList {
  private containerId: any;
  private inputId: any;
  private listId: any;
  private options: any;
  private controller: string;
  private fieldList: string;
  private valueChangedCallback: (p: { controller: string; fieldList: string; value: {name: string; id: string} }) => void;
  private input;
  private newTagCreatedCallback: (tag: string) => void
  private iconNewTabClickedCallBack: (fieldListName: string, controller: string) => void

  constructor(containerId, inputId, listId, options, valueChangedCallback, controller, fieldList, newTagCreatedCallback, iconNewTabClickedCallBack) {
    this.containerId = containerId;
    this.inputId = inputId;
    this.listId = listId;
    this.options = options;
    this.controller = controller;
    this.fieldList = fieldList;
    this.valueChangedCallback = valueChangedCallback as (p: { controller: string; fieldList: string; value: { name: string; id: string; }; }) => void;
    this.input = document.getElementById(this.inputId) as HTMLInputElement;
    this.newTagCreatedCallback = newTagCreatedCallback;
    this.iconNewTabClickedCallBack = iconNewTabClickedCallBack;
  }

  enterPressedHandler(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.newTagCreatedCallback(this.input.value);
    }
  }

  addInputEnterPressListener = () => {
    this.input.addEventListener('keypress', this.enterPressedHandler.bind(this),{once: true})
  }

  removeInputEnterPressListener = () => {
    this.input.removeEventListener('keypress', this.enterPressedHandler.bind(this))
  }

  create(filter = "") {
    const list = document.getElementById(this.listId);
    const filterOptions = this.options.filter(
      d => filter === "" || d.name.includes(filter)
    );

    if (filterOptions.length === 0) {
      list.classList.remove("active");
      if (this.fieldList === 'tagLevel') {
        this.addInputEnterPressListener();
      }
    } else {
      list.classList.add("active");
    }

    list.innerHTML = filterOptions
      .map(o => `<li id=${o.id}>${o.name}</li>`)
      .join("");

  }

  addListeners(datalist) {
    const container = document.getElementById(this.containerId) as HTMLInputElement
    const list = document.getElementById(this.listId);
    const _input = document.getElementById(this.inputId) as HTMLInputElement;
    const iconNewTab = container.getElementsByClassName('new-tab-icon')?.[0];

    iconNewTab?.addEventListener("click", (e) => {
      this.iconNewTabClickedCallBack(this.fieldList, this.controller);
    })

    if (this.fieldList === 'app') {
      container.classList.add('accent');
    }

    //todo add list closing on document click
    container.addEventListener("click", (e) => {
      const element = e.target as HTMLElement;
      if (element.id && element.id === this.inputId) {
        container.classList.toggle("active");
      } else if (element.id === "datalist-icon") {
        container.classList.toggle("active");
        this.input.focus();
      }
    });

    this.input.addEventListener("input", function(e) {
      if (!container.classList.contains("active")) {
        container.classList.add("active");
      }

      datalist.create(_input.value);
    });

    const callValueChangedCallback = (value: {name: string; id: string}) => {
      this.valueChangedCallback({fieldList: this.fieldList, controller: this.controller, value});
    }

    list.addEventListener("click", function(e) {
      const element = e.target as HTMLElement;
      if (element.nodeName.toLocaleLowerCase() === "li") {
        const id = element.getAttribute('id');
        callValueChangedCallback({
            name: element.innerText,
            id
          }
        )
        _input.value = element.innerText;
        container.classList.remove("active");
      }
    });
  }
}
