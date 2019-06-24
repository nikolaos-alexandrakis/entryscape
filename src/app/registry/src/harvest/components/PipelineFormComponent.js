import Alert from 'commons/components/common/alert/Alert';
import Fieldset from 'commons/components/common/form/Fieldset';
import Form from 'commons/components/common/form/Form';
import FormGroup from 'commons/components/common/form/FormGroup';
import RadioInline from 'commons/components/common/form/RadioInline';
import Group from 'commons/components/common/Group';
import config from 'config';
import m from 'mithril';
import CheckboxComponent from './CheckboxComponent';

const getFormGroupComponent = ({ id, value, name, type = 'text', label, help, oninput, readonly = false, disabled }) =>
  m(FormGroup, {
    label: {
      text: label,
      forInput: `${id}--${name}`,
    },
    input: {
      type,
      name: `${id}--${name}`,
      id: `${id}--${name}`,
      oninput,
      value,
      readonly,
      disabled,
    },
    help: {
      text: help,
    },
  });

const getCheckboxComponent = ({ id, name, label, tooltip, checked, disabled, callback }) =>
  m(CheckboxComponent, {
    label,
    tooltip,
    input: {
      id: `${id}--${name}`,
      type: 'checkbox',
      checked,
      disabled,
      required: false,
      classNames: [],
      onchange: callback,
    },
  });

const getInlineRadioComponent = radios => m(Group, {
  components: radios.map(radio => m(RadioInline, radio)),
  classNames: [''],
});

export default class {
  constructor(vnode) {
    this.id = vnode.id;
    this.formId = `${this.id}--orgForm`;
    this.onValidCallback = vnode.onValid;
    this.onInvalidCallback = vnode.onInvalid;
    this.recipes = vnode.recipes; // e.g ['DCAT', 'CKAN', ... ]
    this.isStandardRecipe = true;

    this.setFormData(vnode);

    // bind (to instance) funcs called on events
    this.setOwnOrg = this.setOwnOrg.bind(this);
    this.setPSIOrg = this.setPSIOrg.bind(this);
    this.setTitle = this.setTitle.bind(this);
    this.setDescription = this.setDescription.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.setPsi = this.setPsi.bind(this);
    this.setOrgId = this.setOrgId.bind(this);
    this.setSourceUrl = this.setSourceUrl.bind(this);
    this.setSelectedRecipe = this.setSelectedRecipe.bind(this);
    this.formValidation = this.formValidation.bind(this);
  }

  view() {
    if (!this.isStandardRecipe) {
      return m(Alert, { text: this.bundle.nonStandardRecipe });
    }

    return m(Form, {
      id: this.formId,
    }, [
      m(Group, {
        element: 'div',
        components: [
          this.getOrgDetailsFieldsetComponents(),
          this.getHarvesterDetailsFieldsetComponents(),
        ],
      }),
    ]);
  }

  setOwnOrg(isOn) {
    this.isOwnOrg = isOn;
    this.formValidation();
  }

  setPSIOrg(isOn) {
    this.isPSIOrg = isOn;
    this.formValidation();
  }

  setTitle(title) {
    this.values.title = title;
    this.formValidation();
  }

  setDescription(description) {
    this.values.description = description;
    this.formValidation();
  }

  setUsername(username) {
    this.values.username = username;
    this.formValidation();
  }

  setPsi(psi) {
    this.values.psi = psi;
    this.formValidation();
  }

  setOrgId(orgId) {
    this.values.orgId = orgId;
    this.formValidation();
  }

  setSelectedRecipe(recipe) {
    this.selectedRecipe = recipe;
    // radio button click only triggers onchange event so formValidation needs manual call
    this.formValidation();
  }

  setSourceUrl(url) {
    this.values.sourceUrl = url;
    this.formValidation();
  }

  setFormData(data, redraw = false) {
    const {
      bundle, isOwnOrg, isOwnOrgEnabled, isPSIOrg, isPSIOrgEnabled,
      canChangeOwner = false, values = {}, isStandardRecipe = true,
    } = data;

    this.isStandardRecipe = isStandardRecipe;
    if (this.isStandardRecipe) {
      this.bundle = bundle;
      this.isOwnOrg = isOwnOrg;
      this.isOwnOrgEnabled = isOwnOrgEnabled;
      this.isPSIOrg = isPSIOrg;
      this.isPSIOrgEnabled = isPSIOrgEnabled;
      this.canChangeOwner = canChangeOwner; // can be undefined
      this.values = values; // e.g { title, description, email, psi, orgId, pipeline };
      this.selectedRecipe = 'recipe' in this.values ? this.values.recipe : this.recipes[0];
    }

    // redraw if needed, not at construction
    if (redraw) {
      m.redraw();
    }
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/FormData
   * TODO might not be supported in IE11, MDN not clear
   */
  getFormData() {
    const orgForm = document.getElementById(this.formId);
    const inputs = orgForm.getElementsByTagName('input');

    const data = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const field of inputs) {
      if (field.name || field.id) {
        data[field.name || field.id] = field.value;
      }
    }

    data[`${this.id}--recipe`] = this.selectedRecipe;

    return data;
  }

  formValidation() {
    const data = this.getFormData();
    const isFormValid = Object.keys(data).every(name => this.validate(name, data[name]), this);

    if (isFormValid) {
      this.onValidCallback();
    } else {
      this.onInvalidCallback();
    }
  }

  validate(name, value = null) {
    const origName = name.substring(name.lastIndexOf('--') + 2); // name = create--title
    const v = value || document.getElementById(`${this.id}--${origName}`).value;
    switch (origName) {
      case 'title':
      case 'description':
      case 'orgId':
        if (v != null && v.length === 0) {
          return false;
        }

        break;
      case 'username':
        if (v != null && v.length > 0) {
          // eslint-disable-next-line no-useless-escape,max-len
          const re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
          return re.test(v);
        }

        return false;
      case 'psi':
      case 'sourceUrl': {
        if (v && v.length < 6) {
          return false;
        }

        const isValidURL = (url) => {
          // eslint-disable-next-line no-useless-escape
          const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
          const regexp = new RegExp(expression);
          return regexp.test(url);
        };

        // validate url
        if (!isValidURL(v)) {
          return false;
        }

        break;
      }

      default:
        break;
    }

    return true;
  }

  getOrgDetailsFieldsetComponents() {
    return m(Fieldset, {
      legend: this.bundle.organizationDetails,
      components: [
        this.isOwnOrgEnabled ? getCheckboxComponent({
          id: this.id,
          name: 'ownOrg',
          label: this.bundle.ownLabel,
          tooltip: this.bundle.changeOrganizationOwner,
          checked: this.isOwnOrg,
          disabled: !this.isOwnOrgEnabled,
          callback: m.withAttr('checked', this.setOwnOrg),
        }) : null,
        getFormGroupComponent({
          id: this.id,
          name: 'title',
          label: this.bundle.cPTitle,
          help: this.bundle.cPTitlePlaceholder,
          value: this.values.title,
          oninput: m.withAttr('value', this.setTitle),
        }),
        getFormGroupComponent({
          id: this.id,
          name: 'description',
          label: this.bundle.cPDescription,
          help: this.bundle.cPDescPlaceholder,
          value: this.values.description,
          oninput: m.withAttr('value', this.setDescription),
        }),
        this.canChangeOwner ? getFormGroupComponent({
          id: this.id,
          name: 'username',
          type: 'email',
          label: this.bundle.cPUsernameLabel,
          help: this.bundle.cPUsernamePlaceholder,
          value: this.values.username,
          oninput: m.withAttr('value', this.setUsername),
        }) : null,
        this.isPSIOrgEnabled ? getCheckboxComponent({
          id: this.id,
          name: 'isPSIOrg',
          label: this.bundle.publicLabel,
          tooltip: this.bundle.changeOrganizationTitle,
          checked: this.isPSIOrg,
          disabled: !this.isPSIOrgEnabled,
          callback: m.withAttr('checked', this.setPSIOrg),
        }) : null,
        this.isPSIOrg ? getFormGroupComponent({
          id: this.id,
          name: 'psi',
          type: 'url',
          label: this.bundle.cpWebpage,
          help: this.bundle.cpWebpagePlaceholder,
          value: this.values.psi,
          oninput: m.withAttr('value', this.setPsi),
        }) : null,
        this.isPSIOrg ? getFormGroupComponent({
          id: this.id,
          name: 'psi-datapath',
          type: 'url',
          label: this.bundle.cpPSIWebpage,
          help: this.bundle.cpPSIWebpagePlaceholder,
          value: this.values.psi ? `${this.values.psi}/${config.registry.psidataPath}` : '',
          disabled: true,
        }) : null,
        this.isPSIOrg ? getFormGroupComponent({
          id: this.id,
          name: 'orgId',
          label: this.bundle.cpOrgId,
          help: this.bundle.cpOrgIdPlaceholder,
          value: this.values.orgId,
          oninput: m.withAttr('value', this.setOrgId),
        }) : null,
      ],
    });
  }

  getHarvesterDetailsFieldsetComponents() {
    const radiosData = this.recipes.map(recipe => ({
      label: recipe,
      name: `${this.id}--pipelineType`,
      id: `${this.id}--pipelineRadio${recipe}`,
      checked: this.selectedRecipe === recipe,
      onclick: m.withAttr('data-recipe', this.setSelectedRecipe),
    }));

    return m(Fieldset, {
      legend: this.bundle.harvesterDetails,
      components: [
        getInlineRadioComponent(radiosData),
        getFormGroupComponent({
          id: `${this.id}`,
          name: 'sourceUrl',
          type: 'url',
          label: this.bundle.epUrl,
          help: this.bundle[`pipelineDescriptionType${this.selectedRecipe}`],
          value: 'sourceUrl' in this.values ? this.values.sourceUrl : false,
          oninput: m.withAttr('value', this.setSourceUrl),
        }),
      ],
    });
  }
}
