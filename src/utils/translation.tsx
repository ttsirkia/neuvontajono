import { FC } from "react";
import { FormattedMessage, IntlShape } from "react-intl";
import { en } from "../translations/en";
import { fi } from "../translations/fi";
import { Translations } from "../translations/translations";

type SupportedLanguages = "en" | "fi";
type TypedMessageProps = {
  id: keyof Translations;
  values?: Record<string, any>;
};

export type Language = SupportedLanguages | Omit<String, SupportedLanguages>;

// ************************************************************************************************
// Back-end functions

export const getTranslations = (language: Language): Record<string, string> => {
  if (language === "en") {
    return en;
  } else if (language === "fi") {
    return fi;
  } else {
    return en;
  }
};

// ************************************************************************************************
// Front-end functions

/**
 * This is a helper component to create `FormattedMessage`element with the
 * autocomplete feature for the available strings in IDE.
 */
export const TypedFormattedMessage: FC<TypedMessageProps> = (props) => {
  return <FormattedMessage id={props.id} values={props.values} />;
};

/**
 * Returns the requested translated string. This requires the intl object
 * provided by the `useIntl` hook.
 */
export const getTypedFormattedString = (intl: IntlShape, id: keyof Translations, values?: any) => {
  return intl.formatMessage({ id }, values);
};

export const getFormattedString = (intl: IntlShape, id: string, values?: any) => {
  return intl.formatMessage({ id }, values);
};
