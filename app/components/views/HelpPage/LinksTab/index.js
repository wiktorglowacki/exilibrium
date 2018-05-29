import { FormattedMessage as T } from "react-intl";
import { HelpLink, HelpLinkInfoModal } from "buttons";
import { ConstitutionModalContent } from "modals";
import { DescriptionHeader } from "layout";
import "style/Help.less";

export const LinksTabHeader = () => (
  <DescriptionHeader
    description={
      <T
        id="help.description.links"
        m="If you have any difficulty with exilibrium, please use the following links to help find a solution."
      />
    }
  />
);

export const LinksTab = () => (
  <div className="help-icons-list">
    <HelpLink className={"help-github-icon"} href="https://github.com/EXCCoin/exilibrium">
      <T id="help.github" m="Github" />
    </HelpLink>
    <HelpLink className={"help-docs-icon"} href="https://docs.excc.org/">
      <T id="help.documentation" m="Documentation" />
    </HelpLink>
    <HelpLink className={"help-stakepools-icon"} href="https://excc.co/stakepools">
      <T id="help.stakepools" m=" Stakepools" />
    </HelpLink>
    <HelpLink className={"help-forum-icon"} href="https://forum.excc.co">
      <T id="help.forum" m="Forum" />{" "}
    </HelpLink>
    <HelpLinkInfoModal
      className={"help-constitution-icon"}
      modalTitle={
        <h1>
          <T id="help.constitution.modal.title" m="Excc Constitution" />
        </h1>
      }
      modalContent={<ConstitutionModalContent />}
      buttonLabel={<T id="help.constitution" m="Constitution" />}
    />
  </div>
);
