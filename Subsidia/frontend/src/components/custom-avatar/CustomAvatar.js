import PropTypes from 'prop-types';
import { forwardRef, useCallback, useEffect, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Badge, Avatar, Tooltip } from '@mui/material';
import axios from '../../utils/axios';
// ----------------------------------------------------------------------

const getCharAtName = (name) => name && name.charAt(0).toUpperCase();

const getColorByName = (name) => {
  if (['A', 'N', 'H', 'L', 'Q'].includes(getCharAtName(name))) return 'primary';
  if (['F', 'G', 'T', 'I', 'J'].includes(getCharAtName(name))) return 'info';
  if (['K', 'D', 'Y', 'B', 'O'].includes(getCharAtName(name))) return 'success';
  if (['P', 'E', 'R', 'S', 'U'].includes(getCharAtName(name))) return 'warning';
  if (['V', 'W', 'X', 'M', 'Z'].includes(getCharAtName(name))) return 'error';
  return 'default';
};

// ----------------------------------------------------------------------

const CustomAvatar = forwardRef(({ color, name = '', BadgeProps, children, sx, ...other }, ref) => {
  const theme = useTheme();

  const charAtName = getCharAtName(name);
  const colorByName = getColorByName(name);
  const colr = color || colorByName;

  const [avatarSrc, setAvatarSrc] = useState(null);

  const getAvatarImage = useCallback(async () => {
    const cachedAvatarUrls = localStorage.getItem('avatarImages') || '{}';

    const avatarCache = JSON.parse(cachedAvatarUrls);
    const cacheExpiration = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

    if (avatarCache[name] && Date.now() - avatarCache[name].timestamp < cacheExpiration) {
      try {
        setAvatarSrc(avatarCache[name].url);
        return;
      } catch (error) {
        //
      }
    }

    try {
      const response = await axios.get(`/avatar/${name}`, {
        responseType: 'blob',
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result.split(',')[1];
        const imageUrl = `data:${response.headers['content-type']};base64,${base64Image}`;
        setAvatarSrc(imageUrl);

        avatarCache[name] = {
          url: imageUrl,
          timestamp: Date.now(),
        };

        localStorage.setItem('avatarImages', JSON.stringify(avatarCache));
      };
      reader.readAsDataURL(response.data);
    } catch (error) {
      avatarCache[name] = {
        url: '',
        timestamp: Date.now(),
      };
      localStorage.setItem('avatarImages', JSON.stringify(avatarCache));
    }
  }, [name]);

  useEffect(() => {
    getAvatarImage();
  }, [getAvatarImage]);

  const renderContent =
    colr === 'default' ? (
      <Tooltip key={name} title={name}>
        <Avatar ref={ref} sx={sx} src={avatarSrc}>
          {name && charAtName}
          {children}
        </Avatar>
      </Tooltip>
    ) : (
      <Tooltip key={name} title={name}>
        <Avatar
          ref={ref}
          sx={{
            color: theme.palette[colr]?.contrastText,
            backgroundColor: theme.palette[colr]?.main,
            fontWeight: theme.typography.fontWeightMedium,
            ...sx,
          }}
          src={avatarSrc}
        >
          {name && charAtName}
          {children}
        </Avatar>
      </Tooltip>
    );

  return BadgeProps ? (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      {...BadgeProps}
    >
      {renderContent}
    </Badge>
  ) : (
    renderContent
  );
});

CustomAvatar.propTypes = {
  sx: PropTypes.object,
  name: PropTypes.string,
  children: PropTypes.node,
  BadgeProps: PropTypes.object,
  color: PropTypes.oneOf([
    'default',
    'primary',
    'secondary',
    'info',
    'success',
    'warning',
    'error',
  ]),
};

export default CustomAvatar;
