import { FormattedMessage as T } from "react-intl";

import { isNullOrUndefined } from "util";
import "style/Input.less";

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      inputUnitDiv: null,
      divClassName: `input-and-unit ${this.props.className || ""} ${
        this.props.disabled ? "disabled" : ""
      }`
    };
  }
  componentDidMount() {
    if (this.props.autoFocus) {
      this.input.focus();
    }
  }
  onInputFocus = e => {
    const { onFocus } = this.props;
    const { inputUnitDiv } = this.state;
    this.setState({ inputUnitDiv: inputUnitDiv.classList.add("active") });
    if (onFocus) {
      onFocus(e);
    }
  };
  onInputBlur = e => {
    const { onBlur } = this.props;
    const { inputUnitDiv } = this.state;
    this.setState({ inputUnitDiv: inputUnitDiv.classList.remove("active") });
    if (onBlur) {
      onBlur(e);
    }
  };
  onKeyDown = e => {
    const { onKeyDownSubmit, onKeyDown } = this.props;
    if (e.keyCode === 13 && onKeyDownSubmit) {
      onKeyDownSubmit(e);
    }
    if (onKeyDown && !e.defaultPrevented) {
      onKeyDown(e);
    }
  };

  render() {
    const {
      showErrors,
      invalidMessage,
      requiredMessage,
      required,
      invalid,
      value,
      placeholder,
      onChange,
      disabled,
      readOnly,
      unit,
      hidden,
      type
    } = this.props;
    return hidden ? null : (
      <Aux>
        <div
          className={this.state.divClassName}
          ref={div => {
            this.state.inputUnitDiv = div;
          }}>
          <input
            ref={input => {
              this.input = input;
            }}
            type={type || "text"}
            className="input"
            disabled={disabled ? disabled : null}
            readOnly={readOnly ? readOnly : null}
            placeholder={placeholder}
            value={isNullOrUndefined(value) ? "" : value}
            onChange={onChange}
            onFocus={this.onInputFocus}
            onBlur={this.onInputBlur}
            onKeyDown={this.onKeyDown}
          />
          {unit ? <div className="unit-area">{unit}</div> : null}
        </div>
        {showErrors ? (
          <div className="input-errors-area">
            {invalid && value ? (
              <div className="input-error">
                {invalidMessage ? (
                  invalidMessage
                ) : (
                  <T id="input.invalidInput" m="This field is wrong" />
                )}
              </div>
            ) : null}
            {required && !value ? (
              <div className="input-error">
                {requiredMessage ? (
                  requiredMessage
                ) : (
                  <T id="input.requiredInput" m="This field is required" />
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </Aux>
    );
  }
}

export default Input;
