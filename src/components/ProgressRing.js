import React, { Component } from 'react';

export class ProgressRing extends Component {
  state = {
    normalizedRadius: this.props.radius - this.props.stroke * 2,
    circumference: (this.props.radius - this.props.stroke * 2) * 2 * Math.PI
  }

  render() {
    const { radius, stroke, progress } = this.props
    const { circumference, normalizedRadius } = this.state
    const strokeDashoffset = circumference - progress / 100 * circumference
    return (
      <svg
        height={radius * 2}
        width={radius * 2}
      >
        <circle
          stroke="#7b5ab2"
          fill="transparent"
          strokeWidth={ stroke }
          strokeDasharray={ circumference + ' ' + circumference }
          style={ { strokeDashoffset: 0 } }
          r={ normalizedRadius }
          cx={ radius }
          cy={ radius }
        />
        <circle
          stroke="#60dc97"
          fill="transparent"
          strokeWidth={ stroke }
          strokeDasharray={ circumference + ' ' + circumference }
          style={ { strokeDashoffset } }
          r={ normalizedRadius }
          cx={ radius }
          cy={ radius }
        />
      </svg>
    );
  }
}
