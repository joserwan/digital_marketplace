import { Msg, Route, State } from 'front-end/lib/app/types';
import Footer from 'front-end/lib/app/view/footer';
import Nav from 'front-end/lib/app/view/nav';
import ViewPage from 'front-end/lib/app/view/page';
import { AppMsg, ComponentView, Dispatch, View } from 'front-end/lib/framework';

import * as PageLanding from 'front-end/lib/pages/landing';
import * as PageNotice from 'front-end/lib/pages/notice';
import * as PageOrgCreate from 'front-end/lib/pages/organization/create';
import * as PageOrgEdit from 'front-end/lib/pages/organization/edit';
import * as PageOrgList from 'front-end/lib/pages/organization/list';
import * as PageSignIn from 'front-end/lib/pages/sign-in';
import * as PageSignOut from 'front-end/lib/pages/sign-out';
import * as PageSignUpStepOne from 'front-end/lib/pages/sign-up/step-one';
import * as PageSignUpStepTwo from 'front-end/lib/pages/sign-up/step-two';
import * as PageUserList from 'front-end/lib/pages/user/list';
import * as PageUserProfile from 'front-end/lib/pages/user/profile';
import Icon from 'front-end/lib/views/icon';
import Link from 'front-end/lib/views/link';
import { default as React } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

interface ViewModalProps {
  modal: State['modal'];
  dispatch: Dispatch<AppMsg<Msg, Route>>;
}

const ViewModal: View<ViewModalProps> = ({ dispatch, modal }) => {
  const { open, content } = modal;
  const closeModal = () => dispatch({ tag: 'closeModal', value: undefined });
  // TODO custom X icon
  return (
    <Modal isOpen={open} toggle={closeModal}>
      <ModalHeader className='align-items-center' toggle={closeModal} close={(<Icon name='times' color='secondary' onClick={closeModal} style={{ cursor: 'pointer' }}/>)}>{content.title}</ModalHeader>
      <ModalBody>{content.body}</ModalBody>
      <ModalFooter className='p-0' style={{ overflowX: 'auto', justifyContent: 'normal' }}>
        <div className='p-3 d-flex flex-md-row-reverse justify-content-start align-items-center text-nowrap flex-grow-1'>
          {content.actions.map(({ button, text, color, msg }, i) => {
            const props = {
              key: `modal-action-${i}`,
              color,
              onClick: () => dispatch(msg),
              className: i === 0 ? 'mx-0' : 'ml-3 mr-0 ml-md-0 mr-md-3'
            };
            if (button) {
              return (<Link button {...props}>{text}</Link>);
            } else {
              return (<Link {...props}>{text}</Link>);
            }
          })}
        </div>
      </ModalFooter>
    </Modal>
  );
};

const ViewActiveRoute: ComponentView<State, Msg> = ({ state, dispatch }) => {
  switch (state.activeRoute.tag) {

    case 'landing':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.landing}
          mapPageMsg={value => ({ tag: 'pageLanding', value })}
          component={PageLanding.component} />
      );

    case 'orgEdit':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.orgEdit}
          mapPageMsg={value => ({ tag: 'pageOrgEdit', value })}
          component={PageOrgEdit.component} />
      );

    case 'orgCreate':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.orgCreate}
          mapPageMsg={value => ({ tag: 'pageOrgCreate', value })}
          component={PageOrgCreate.component} />
      );

    case 'orgList':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.orgList}
          mapPageMsg={value => ({ tag: 'pageOrgList', value })}
          component={PageOrgList.component} />
      );

    case 'userProfile':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.userProfile}
          mapPageMsg={value => ({ tag: 'pageUserProfile', value })}
          component={PageUserProfile.component} />
      );

    case 'userList':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.userList}
          mapPageMsg={value => ({ tag: 'pageUserList', value })}
          component={PageUserList.component} />
      );

    case 'signIn':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.signIn}
          mapPageMsg={value => ({ tag: 'pageSignIn', value })}
          component={PageSignIn.component} />
      );

    case 'signOut':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.signOut}
          mapPageMsg={value => ({ tag: 'pageSignOut', value })}
          component={PageSignOut.component} />
      );

    case 'signUpStepOne':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.signUpStepOne}
          mapPageMsg={value => ({ tag: 'pageSignUpStepOne', value })}
          component={PageSignUpStepOne.component} />
      );

    case 'signUpStepTwo':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.signUpStepTwo}
          mapPageMsg={value => ({ tag: 'pageSignUpStepTwo', value })}
          component={PageSignUpStepTwo.component} />
      );

    case 'notice':
      return (
        <ViewPage
          dispatch={dispatch}
          pageState={state.pages.notice}
          mapPageMsg={value => ({ tag: 'pageNotice', value })}
          component={PageNotice.component} />
      );
  }
};

const view: ComponentView<State, Msg> = ({ state, dispatch }) => {
  if (!state.ready) {
    return null;
  } else {
    return (
      <div className={`route-${state.activeRoute.tag} ${state.transitionLoading > 0 ? 'in-transition' : ''} app d-flex flex-column`} style={{ minHeight: '100vh' }}>
        <Nav session={state.shared.session} activeRoute={state.activeRoute} isOpen={state.isNavOpen} toggleIsOpen={value => dispatch({ tag: 'toggleIsNavOpen', value })} />
        <ViewActiveRoute state={state} dispatch={dispatch} />
        <Footer session={state.shared.session} />
        <ViewModal dispatch={dispatch} modal={state.modal} />
      </div>
    );
  }
};

export default view;