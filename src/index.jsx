//* modules
import React, { useEffect, useState } from "react"
import PropTypes from 'prop-types';
/** *========================================
 ** Main Function Hook -  Before unload
 */

const BeforeUnload = ({ 
  ignoreBeforeUnloadAlert = false, 
  blockRoute = true, 
  children, 
  handleAfterLeave,   
  modalComponentHandler,
  alertMessage = "Are you sure you want to leave? Changes will not be saved."
}) => {
  /**
   * * States
   */
  const [showModal, setShowModal] = useState(false)
  const [internalData, setInternalData] = useState({})  
  /**
   * * Functions
   */  

  const handleModalCancel = event => {
    if (event && event.preventDefault) event.preventDefault()
    setShowModal(false)
  }

  const handleModalLeave = event => {
    if (event && event.preventDefault) event.preventDefault()
    
    if(handleAfterLeave)
      handleAfterLeave(internalData)
    else {
      window.location.assign(internalData.to)
    }

  }

  const defaultModalHandler = () => {
    const r = confirm(alertMessage);
    setShowModal(false)
    if (r == true) {
      handleModalLeave()
    } else {
      handleModalCancel()
    }
  }

  const onUnload = e => {
    setShowModal(false);
    if (blockRoute) {
      e.preventDefault()
      e.returnValue = '';
    }
  }

  const handleClickEvents = (e) => {

    if (
      blockRoute &&
      e.currentTarget.pathname &&
      e.currentTarget.pathname !== "" &&
      (e.currentTarget.pathname !== window.location.pathname || e.currentTarget.search !== window.location.search)
    ) {
      e.preventDefault();
      const {pathname, search, hash} = e.target;
      let path = pathname;      
      if(search && search !== "") {
        path = path + search;
      }
      if(hash && hash !== "") {
        path = path + hash;
      }

      setInternalData({
        to: path,
        toHref: e.target.href,
        target: e.target
      })
      setShowModal(true)
    }
  }

  const setEventListeners = () => {
    const links = document.getElementsByTagName('a');    
    for(var i = 0; i< links.length; i++){
      links[i].addEventListener("click",handleClickEvents,false);
    }

    if(!ignoreBeforeUnloadAlert)
      window.addEventListener("beforeunload", onUnload)
  }

  const removeEventListeners = () => {
    const links = document.getElementsByTagName('a');
    for(var i = 0; i< links.length; i++){
      links[i].removeEventListener("click",handleClickEvents,false);
    }

    if(!ignoreBeforeUnloadAlert)
      window.removeEventListener("beforeunload", onUnload)
  }

  const defaultComponentAlert = modalComponentHandler ||  defaultModalHandler;

  /**
   * * Effect
   */

  useEffect(() => {
    setEventListeners()
    return () => {
      removeEventListeners()      
    }
  })

  /**
   * * React dom
   */

  return (
    <React.Fragment>
      {showModal ? defaultComponentAlert({handleModalLeave, handleModalCancel}) : null}
      {children}
    </React.Fragment>
  )
}

BeforeUnload.propTypes = {
  blockRoute: PropTypes.bool, 
  ignoreBeforeUnloadAlert: PropTypes.bool,   
  children: PropTypes.any.isRequired,
  alertMessage: PropTypes.string,
  handleAfterLeave: PropTypes.func,
  modalComponentHandler: PropTypes.any
};

export default BeforeUnload;
