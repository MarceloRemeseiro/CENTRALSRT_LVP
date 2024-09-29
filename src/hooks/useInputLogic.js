import { useState, useEffect, useCallback, useRef } from 'react';

export const useInputLogic = (input, agregarPuntoPublicacion, eliminarPuntoPublicacion, toggleOutputState) => {
  const [localInput, setLocalInput] = useState(input);
  const [localOutputs, setLocalOutputs] = useState(input.customOutputs || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoRefreshTrigger, setVideoRefreshTrigger] = useState(0);
  const [newOutput, setNewOutput] = useState({ nombre: '', url: '', streamKey: '' });
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const refreshTimeoutRef = useRef(null);

  const fetchInputStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/process/${input.id}/state`);
      const data = await response.json();
      setLocalInput((prevInput) => {
        if (prevInput.state !== data.state) {
          if (data.state === 'running') {
            if (refreshTimeoutRef.current) {
              clearTimeout(refreshTimeoutRef.current);
            }
            refreshTimeoutRef.current = setTimeout(() => {
              setVideoRefreshTrigger(prev => prev + 1);
            }, 3000);
          }
          return { ...prevInput, ...data };
        }
        return prevInput;
      });
    } catch (error) {
      console.error('Error fetching input status:', error);
    }
  }, [input.id]);

  useEffect(() => {
    fetchInputStatus();
    const intervalId = setInterval(fetchInputStatus, 5000);
    return () => {
      clearInterval(intervalId);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchInputStatus]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOutput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newOutput.nombre && newOutput.url) {
      try {
        const createdOutput = await agregarPuntoPublicacion(input.id, newOutput);
        if (createdOutput) {
          setLocalOutputs(prevOutputs => [...prevOutputs, createdOutput]);
          setLocalInput(prevInput => ({
            ...prevInput,
            customOutputs: [...(prevInput.customOutputs || []), createdOutput]
          }));
        }
        setNewOutput({ nombre: '', url: '', streamKey: '' });
        closeModal();
      } catch (error) {
        console.error('Error al agregar el punto de publicación:', error);
        alert('Error al agregar el punto de publicación. Por favor, inténtelo de nuevo.');
      }
    } else {
      alert('Por favor, complete al menos el nombre y la URL.');
    }
  };

  const handleEliminarPunto = (outputId) => {
    setConfirmationModal({
      isOpen: true,
      message: '¿Seguro quieres eliminar este Punto de publicación?',
      onConfirm: () => performEliminarPunto(outputId),
    });
  };

  const performEliminarPunto = async (outputId) => {
    const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
    console.log('ID corregido para eliminar:', correctedOutputId);

    try {
      await eliminarPuntoPublicacion(input.id, correctedOutputId);
      setLocalOutputs(prevOutputs => prevOutputs.filter(output => output.id !== outputId));
    } catch (error) {
      console.error('Error al eliminar el punto de publicación:', error);
      alert('Error al eliminar el punto de publicación. Por favor, inténtelo de nuevo.');
    }
  };

  const handleToggle = async (outputId, currentState, index) => {
    if (currentState === 'running') {
      setConfirmationModal({
        isOpen: true,
        message: '¿Seguro quieres apagar el Punto de publicación?',
        onConfirm: () => performToggle(outputId, currentState, index),
      });
    } else {
      performToggle(outputId, currentState, index);
    }
  };

  const performToggle = async (outputId, currentState, index) => {
    const newState = currentState === 'running' ? 'stop' : 'start';

    try {
      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index
            ? { ...output, isTogglingOn: newState === 'start' }
            : output
        )
      );

      const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
      console.log('ID corregido:', correctedOutputId);

      const updatedOutput = await toggleOutputState(correctedOutputId, newState);

      console.log('Estado actualizado recibido:', updatedOutput.state);

      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index
            ? { ...output, state: updatedOutput.state, isTogglingOn: undefined }
            : output
        )
      );

      setTimeout(async () => {
        const refreshedState = await fetchOutputState(correctedOutputId);
        setLocalOutputs((prevOutputs) =>
          prevOutputs.map((output, i) =>
            i === index
              ? { ...output, state: refreshedState }
              : output
          )
        );
      }, 2000);

    } catch (error) {
      console.error('Error al cambiar el estado del output:', error);
      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index ? { ...output, isTogglingOn: undefined } : output
        )
      );
    }
  };

  const fetchOutputState = async (outputId) => {
    try {
      const response = await fetch(`/api/process/${outputId}/state`);
      const data = await response.json();
      return data.state;
    } catch (error) {
      console.error('Error al obtener el estado del output:', error);
      return 'unknown';
    }
  };

  return {
    localInput,
    setLocalInput, 
    localOutputs,
    setLocalOutputs, 
    isModalOpen,
    videoRefreshTrigger,
    newOutput,
    confirmationModal,
    openModal,
    closeModal,
    handleInputChange,
    handleSubmit,
    handleEliminarPunto,
    handleToggle,
    setConfirmationModal,
  };
};