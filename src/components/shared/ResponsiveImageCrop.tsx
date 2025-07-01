import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import styled from 'styled-components';
import { colors, fonts, breakpoints } from '../../theme/styleVars';
import Button from './Button';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropResult {
  croppedAreaPixels: CropArea;
  croppedAreaPercentages: CropArea;
  rotation: number;
}

interface ResponsiveImageCropProps {
  imageSrc: string;
  onCropComplete: (cropResult: CropResult) => void;
  onCancel?: () => void;
  onSave?: () => void;
  aspect?: number;
  cropShape?: 'rect' | 'round';
  showGrid?: boolean;
  disabled?: boolean;
  initialCrop?: { x: number; y: number };
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

const ResponsiveImageCrop: React.FC<ResponsiveImageCropProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  onSave,
  aspect = 1,
  cropShape = 'rect',
  showGrid = true,
  disabled = false,
  initialCrop = { x: 0, y: 0 },
  initialZoom = 1,
  minZoom = 1,
  maxZoom = 3
}) => {
  const [crop, setCrop] = useState(initialCrop);
  const [zoom, setZoom] = useState(initialZoom);
  const [rotation, setRotation] = useState(0);

  const onCropCompleteHandler = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      const cropResult: CropResult = {
        croppedAreaPixels,
        croppedAreaPercentages: croppedArea,
        rotation
      };
      onCropComplete(cropResult);
    },
    [onCropComplete, rotation]
  );

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleReset = () => {
    setCrop(initialCrop);
    setZoom(initialZoom);
    setRotation(0);
  };

  return (
    <Container>
      <CropperContainer>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropCompleteHandler}
          cropShape={cropShape}
          showGrid={showGrid}
          minZoom={minZoom}
          maxZoom={maxZoom}
          style={{
            containerStyle: {
              backgroundColor: colors.black,
              borderRadius: '8px'
            },
            mediaStyle: { borderRadius: '8px' }
          }}
        />
      </CropperContainer>

      <Controls>
        <ZoomControls>
          <ZoomLabel>Zoom</ZoomLabel>
          <ZoomSlider
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={disabled}
          />
          <ZoomValue>{Math.round(zoom * 100)}%</ZoomValue>
        </ZoomControls>

        <RotationControls>
          <ControlButton
            onClick={handleRotateLeft}
            disabled={disabled}
            text="⟲"
            variant="secondary"
            title="Rotate left"
          />
          <ControlButton
            onClick={handleRotateRight}
            disabled={disabled}
            text="⟳"
            variant="secondary"
            title="Rotate right"
          />
          <ControlButton
            onClick={handleReset}
            disabled={disabled}
            text="RESET"
            variant="secondary"
          />
        </RotationControls>

        <ActionButtons>
          {onCancel && (
            <ActionButton
              onClick={onCancel}
              disabled={disabled}
              text="Cancel"
              variant="secondary"
            />
          )}
          {onSave && (
            <ActionButton
              onClick={onSave}
              disabled={disabled}
              text="Save"
              variant="success"
            />
          )}
        </ActionButtons>
      </Controls>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CropperContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${colors.black};

  @media (max-width: ${breakpoints.md}) {
    height: 500px;
  }

  @media (max-width: ${breakpoints.sm}) {
    height: 400px;
  }
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 10px;

  @media (max-width: ${breakpoints.md}) {
    gap: 12px;
  }
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: ${breakpoints.sm}) {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
`;

const ZoomLabel = styled.label`
  font-family: ${fonts.mainFont};
  font-size: 14px;
  font-weight: 600;
  color: ${colors.gray};
  min-width: 40px;

  @media (max-width: ${breakpoints.sm}) {
    text-align: center;
    min-width: auto;
  }
`;

const ZoomSlider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: ${colors.lightGrey};
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
    border: 2px solid ${colors.white};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
    border: 2px solid ${colors.white};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ZoomValue = styled.span`
  font-family: ${fonts.mainFont};
  font-size: 12px;
  color: ${colors.grayishBlue};
  min-width: 40px;
  text-align: right;

  @media (max-width: ${breakpoints.sm}) {
    text-align: center;
    min-width: auto;
  }
`;

const RotationControls = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;

  @media (max-width: ${breakpoints.sm}) {
    flex-wrap: wrap;
  }
`;

const ControlButton = styled(Button)`
  min-width: 60px;
  padding: 8px 12px;
  font-size: 14px;

  @media (max-width: ${breakpoints.sm}) {
    flex: 1;
    min-width: auto;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;

  @media (max-width: ${breakpoints.sm}) {
    flex-direction: column;
    gap: 10px;
  }
`;

const ActionButton = styled(Button)`
  min-width: 100px;

  @media (max-width: ${breakpoints.sm}) {
    width: 100%;
    min-width: auto;
  }
`;

export default ResponsiveImageCrop;
