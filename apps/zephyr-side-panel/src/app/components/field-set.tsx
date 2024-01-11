interface DataListConfig {
  listId: string;
  currentValue: string;
}

interface FieldSetProps {
  fieldListName: string;
  title: string;
  dataListConfig?: DataListConfig;
}

function FieldSet({ fieldListName, title, dataListConfig }: FieldSetProps) {
  dataListConfig = dataListConfig || ({} as DataListConfig);
  const showNewTabIcon = !!(
    fieldListName !== 'appLevel' && fieldListName !== 'tagLevel'
  );
  return (
    <fieldset name={fieldListName}>
      <label>{title}</label>
      <div className="dataList">
        {showNewTabIcon ? (
          <img src="assets/icons/new-tab.png" alt="" className="new-tab-icon" />
        ) : null}
        <input
          type="text"
          value={dataListConfig.currentValue}
          className="dataList-input"
        />
        <img
          src="assets/icons/arrow-down.png"
          alt=""
          className="arrow-down-icon"
        />
        <ul className="dataList-ul"></ul>
      </div>
    </fieldset>
  );
}
